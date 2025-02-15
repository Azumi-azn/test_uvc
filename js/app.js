const videoElement = document.getElementById('video');
const videoSelect = document.getElementById('videoSelect');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./js/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
} 

// PWAインストールプロンプト用グローバル変数
let deferredPrompt;

// beforeinstallpromptイベントをキャプチャ
window.addEventListener('beforeinstallprompt', (e) => {
    // デフォルト動作をキャンセルして任意のタイミングで呼び出し可能にする
    e.preventDefault();
    deferredPrompt = e;
    // 必要に応じて、ここで「アプリに追加」ボタンを表示する
    console.log('インストールプロンプトが利用可能です');
});

videoElement.addEventListener('click', () => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) { // Safari
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) { // IE/Edge
      videoElement.msRequestFullscreen();
    }
  });

  
  function getDevices() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        videoSelect.innerHTML = '';
        videoDevices.forEach(device => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.text = device.label || `Camera ${videoSelect.length + 1}`;
          videoSelect.appendChild(option);
        });
        if (videoDevices.length > 0) {
          startStream(videoDevices[0].deviceId);
        }
      })
      .catch(error => console.error('デバイスの取得に失敗しました:', error));
  }
  
  function startStream(deviceId) {
    const constraints = {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 }
      },
      audio: false
    };
  
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
        // ビデオトラックの設定を確認する例
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log('Current resolution:', settings.width, 'x', settings.height);
        console.log('Current frame rate:', settings.frameRate);
        
        // カメラ使用許可後にカメラ選択リストを更新する
        updateCameraList();
      })
      .catch(error => {
        console.error('ビデオストリームの取得に失敗しました:', error);
      });
  }
  
  videoSelect.addEventListener('change', () => {
    startStream(videoSelect.value);
  });
  
  // ユーザー操作でカメラを起動させるために、Start Cameraボタンのイベントを追加
  const startCameraButton = document.getElementById('startCameraButton');
  startCameraButton.addEventListener('click', () => {
    // ユーザー操作直後にgetUserMediaで許可リクエスト
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        // 取得したストリームをすぐ停止（許可確認のみ目的）
        stream.getTracks().forEach(track => track.stop());
        // カメラ許可後にデバイスリストを更新
        getDevices();
      })
      .catch(error => {
        console.error('カメラのアクセスに失敗しました:', error);
      });
  });
  
  // カメラ選択リスト更新用関数
  function updateCameraList() {
    navigator.mediaDevices.enumerateDevices().then(function(devices) {
      const videoSelect = document.getElementById('videoSelect');
      // 古いオプションを削除
      videoSelect.innerHTML = '';
      devices.forEach(function(device) {
        if (device.kind === 'videoinput') {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.text = device.label || 'カメラ ' + (videoSelect.length + 1);
          videoSelect.appendChild(option);
        }
      });
    });
  }