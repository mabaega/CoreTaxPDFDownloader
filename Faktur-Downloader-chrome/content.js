// content.js

function showSwal(message) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "info",
      title: "Info",
      text: message,
    });
  } else {
    alert(message);
  }
}

(function () {

  if (window.location.hostname !== "coretaxdjp.pajak.go.id") {
    Swal.fire({
      icon: "info",
      title: "Free-CoreTax PDF Faktur Downloader",
      text: "Ekstensi ini hanya berfungsi di situs coretaxdjp.pajak.go.id",
      showDenyButton: true,
      confirmButtonText: "Dukung Developer",
      denyButtonText: "OK",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        showDonationQR();
      }
    });
    return;
  }

  if (window.downloadInProgress) {
    console.log("Download already in progress");
    return;
  }

  const table = document.querySelector("div.p-datatable-wrapper table");
  if (!table) {
    showSwal("Tabel Data Faktur tidak ditemukan.");
    return;
  }

  const rows = table.querySelectorAll("tbody tr");
  let count = 0;
  let targetRows = [];

  rows.forEach((row, index) => {
    const checkboxBox = row.querySelector(".p-checkbox-box");
    const isChecked = checkboxBox?.classList.contains("p-highlight");
    if (isChecked) {
      const downloadBtn = row.querySelector('button#DownloadButton');
      if (downloadBtn) {
        const cells = Array.from(row.querySelectorAll("td")).map((td) => td.textContent.trim());
        const identifier = cells[5]; // Nomor Faktur Pajak
        targetRows.push({
          index,
          cells,
          identifier,
          processed: false,
        });
        count++;
      }
    }
  });

  if (count === 0) {
    Swal.fire({
      icon: "info",
      title: "Pilih Faktur",
      text: "Silahkan pilih faktur yang akan didownload.",
      showDenyButton: true,
      confirmButtonText: "Dukung Developer",
      denyButtonText: "OK",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        showDonationQR();
      }
    });
    return;
  }

  Swal.fire({
    icon: "question",
    title: "Konfirmasi Download",
    text: `Akan mendownload ${count} faktur. Lanjutkan?`,
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      startDownloadProcess();
    }
  });

  function showDonationQR() {
    setTimeout(() => {
      const container = document.createElement("div");
      container.id = "qris-container";
      const qrCodeDiv = document.createElement("div");
      qrCodeDiv.id = "qris-qrcode";
      qrCodeDiv.style.margin = "0 auto";
      qrCodeDiv.style.width = "200px";
      qrCodeDiv.style.height = "200px";
      container.appendChild(qrCodeDiv);

      const description = document.createElement("div");
      description.innerHTML = `
        <p style="margin-top:8px;font-size:14px;">Scan QRIS ini untuk mendukung pengembang</b></p>
        <hr>
        <div style="font-size:13px;"><b>---- Terima Kasih ----</b></div>
      `;
      container.appendChild(description);

      Swal.fire({
        title: "Dukung Pengembang",
        html: container,
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonText: "Tutup",
        didOpen: () => {
          new QRCode(document.getElementById("qris-qrcode"), {
            text: '00020101021126610014COM.GO-JEK.WWW01189360091430849758110210G0849758110303UMI51440014ID.CO.QRIS.WWW0215ID10254219865360303UMI5204899953033605802ID5925I MADE BAMBANG ERA GUNAWA6014BANDAR LAMPUNG61053515562070703A016304A9B7', //'{"qr_id":"3ca084e2-7bbd-4269-a7dd-2fddf2694240"}',
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.L,
          });
        },
      });
    }, 100);
  }

  function startDownloadProcess() {
    window.downloadInProgress = true;
    localStorage.setItem("pendingDownloads", JSON.stringify({
      targets: targetRows,
      currentIndex: 0,
      totalCount: count,
      startTime: Date.now(),
    }));
    showProgressDialog(0, count);
    setTimeout(processDownloads, 500);
  }

  function showProgressDialog(completed, total) {
    Swal.fire({
      title: "Sedang Mendownload...",
      html: `
        <div>Progress: <span id="download-progress">${completed}</span>/${total}</div>
        <div style="margin-top: 10px;">
          <div style="background: #f0f0f0; border-radius: 10px; height: 20px; overflow: hidden;">
            <div id="progress-bar" style="background: #28a745; height: 100%; border-radius: 10px; width: ${(completed / total) * 100}%; transition: width 0.3s ease-in-out;"></div>
          </div>
        </div>
        <div id="download-status" style="margin-top: 10px; font-size: 12px; color: #666;">Memproses...</div>
        <div id="download-timer" style="margin-top: 5px; font-size: 11px; color: #999;"></div>
        <div style="margin-top: 10px; font-size: 10px; color: #007bff;">Sistem akan menunggu halaman refresh dan melanjutkan otomatis</div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
        updateTimer();
      },
    });
  }

  function updateTimer() {
    const timerElement = document.getElementById("download-timer");
    const pendingData = JSON.parse(localStorage.getItem("pendingDownloads") || "{}");
    if (timerElement && pendingData.startTime) {
      const elapsed = Math.floor((Date.now() - pendingData.startTime) / 500);
      timerElement.textContent = `Waktu berjalan: ${elapsed} detik`;
    }
    if (window.downloadInProgress) {
      setTimeout(updateTimer, 500);
    }
  }

  function findTargetRow(targetData) {
    const currentTable = document.querySelector("div.p-datatable-wrapper table");
    if (!currentTable) return null;
    const currentRows = currentTable.querySelectorAll("tbody tr");
    for (let row of currentRows) {
      const cells = Array.from(row.querySelectorAll("td")).map((td) => td.textContent.trim());
      const identifier = cells[5];
      if (identifier === targetData.identifier) return row;
    }
    return null;
  }

  function processDownloads() {
    const pendingData = JSON.parse(localStorage.getItem("pendingDownloads"));
    if (!pendingData) return finishProcess();

    const { targets, currentIndex, totalCount } = pendingData;
    if (currentIndex >= targets.length) return finishProcess();

    const currentTarget = targets[currentIndex];
    const statusElement = document.getElementById("download-status");
    if (statusElement) statusElement.textContent = `Memproses faktur ${currentIndex + 1} dari ${totalCount}...`;

    const targetRow = findTargetRow(currentTarget);
    if (targetRow) {
      const downloadBtn = targetRow.querySelector("button#DownloadButton");
      if (downloadBtn && !downloadBtn.disabled) {
        try {
          downloadBtn.click();
        } catch (e) {
          console.error("Click error:", e);
        }
        updateProgress(currentIndex + 1, totalCount);
        pendingData.currentIndex++;
        localStorage.setItem("pendingDownloads", JSON.stringify(pendingData));
        setTimeout(processDownloads, 2500);
        return;
      }
    }

    pendingData.currentIndex++;
    localStorage.setItem("pendingDownloads", JSON.stringify(pendingData));
    updateProgress(currentIndex + 1, totalCount);
    setTimeout(processDownloads, 500);
  }

  function updateProgress(completed, total) {
    const progressElement = document.getElementById("download-progress");
    const progressBar = document.getElementById("progress-bar");
    if (progressElement) progressElement.textContent = completed;
    if (progressBar) progressBar.style.width = (completed / total) * 100 + "%";
  }

  function finishProcess() {
    window.downloadInProgress = false;
    localStorage.removeItem("pendingDownloads");
    const totalFiles = targetRows.length;
    Swal.fire({
      icon: "success",
      title: "Download Selesai",
      text: `Berhasil memproses ${totalFiles} faktur.`,
      showDenyButton: true,
      confirmButtonText: "Tutup",
      denyButtonText: "Dukung Developer",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isDenied) {
        showDonationQR();
      }
    });
  }

  const pendingDownloads = localStorage.getItem("pendingDownloads");
  if (pendingDownloads && !window.downloadInProgress) {
    const data = JSON.parse(pendingDownloads);
    if (data.currentIndex < data.targets.length) {
      console.log("Resuming downloads from localStorage...");
      window.downloadInProgress = true;
      targetRows = data.targets;
      count = data.totalCount;
      showProgressDialog(data.currentIndex, data.totalCount);
      setTimeout(processDownloads, 500);
    }
  }
})();
