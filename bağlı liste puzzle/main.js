const { app, BrowserWindow } = require('electron');

let win;

function createWindow() {
  // Yeni bir tarayıcı penceresi oluştur
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Uygulamanın giriş noktasını yükle
  win.loadFile('renderer/index.html');

  // Tarayıcı penceresi kapatıldığında uygulamayı kapat
  win.on('closed', () => {
    win = null;
    app.quit();
  });
}

// Uygulama başlatıldığında tarayıcı penceresi oluştur
app.on('ready', createWindow);

// Tüm penceler kapatıldığında uygulamayı kapat
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Pencere oluşturulduğunda odaklan
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
