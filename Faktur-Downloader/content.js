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
  const table = document.querySelector("div.p-datatable-wrapper table");

  if (!table) {
    showSwal("Tabel Data Faktur tidak ditemukan.");
    return;
  }

  const rows = table.querySelectorAll("tbody tr");
  let count = 0;
  let checkedRows = [];

  rows.forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox?.checked) {
      checkedRows.push(row);
      count++;
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
        Swal.fire({
          title: "Dukung Developer",
          html: `
    <img src="${chrome.runtime.getURL('icons/icon120.png')}"
         alt="QRIS"
         width="119" height="120"
         style="display:block;margin:auto;border-radius:8px;border:1px solid #ccc;margin-top:10px;max-width:100%;">
    <p style="margin-top:8px;font-size:14px;">
      Scan QR ini untuk donasi via <b>GoPay / QRIS</b>
    </p>
    <hr>
    <div style="font-size:13px;">
      <b>GoPay:</b> 08127914454<br>
      <b>Nama:</b> Mabaega
    </div>
  `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: "Tutup",
        });
      }
      // Jika OK diklik, swal otomatis tertutup
    });
    return;
  }

  // Jika ada yang dipilih, konfirmasi dulu sebelum download
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
      // Mulai proses download
      checkedRows.forEach((row, idx) => {
        const downloadBtn = row.querySelector('button#DownloadButton');
        if (downloadBtn) {
          setTimeout(() => {
            downloadBtn.click();
          }, 500 * idx); // jeda antar klik
        }
      });

      // Setelah selesai (estimasi waktu selesai = 500ms * count)
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Download Selesai",
          text: `Menjalankan klik Download untuk ${count} Faktur.`,
          showDenyButton: true,
          confirmButtonText: "Tutup",
          denyButtonText: "Dukung Developer",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isDenied) {
            // Tampilkan swal QRIS hanya jika tombol "Dukung Developer" diklik
            Swal.fire({
              title: "Dukung Developer",
              html: `
    <img src="${chrome.runtime.getURL('icons/icon120.png')}"
         alt="QRIS"
         width="119" height="120"
         style="display:block;margin:auto;border-radius:8px;border:1px solid #ccc;margin-top:10px;max-width:100%;">
    <p style="margin-top:8px;font-size:14px;">
      Scan QR ini untuk donasi via <b>GoPay / QRIS</b>
    </p>
    <hr>
    <div style="font-size:13px;">
      <b>GoPay:</b> 08127914454<br>
      <b>Nama:</b> Mabaega
    </div>
  `,
              showCloseButton: true,
              focusConfirm: false,
              confirmButtonText: "Tutup",
            });
          }
          // Jika "Tutup" diklik (result.isConfirmed), swal otomatis tertutup
        });
      }, 500 * count + 500); // +500ms agar swal muncul setelah proses klik selesai
    }
    // Jika batal, tidak melakukan apa-apa
  });
})();


