
document.addEventListener('DOMContentLoaded', () => {
  let soundEnabled = false;
  window.enableSound = function () {
  const siren = document.getElementById('alertBeep');
  siren.play().then(() => {
    siren.pause();
    siren.currentTime = 0;
    soundEnabled = true;
    alert("🔊 Siren Enabled");
  }).catch(() => {
    alert("Click again to allow sound");
  });
};
  // Dark Mode
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
  });
// ---------------- DRIVER REGISTRATION ----------------
const driverModal = new bootstrap.Modal(document.getElementById('driverModal'));

document.getElementById('registerDriverBtn').addEventListener('click', () => {
  driverModal.show();

  // Fetch live location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        document.getElementById('driverLocation').value =
          `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
      },
      () => {
        document.getElementById('driverLocation').value = "Location denied";
      }
    );
  }
});

document.getElementById('saveDriverBtn').addEventListener('click', () => {
  const driverData = {
    name: document.getElementById('driverName').value,
    age: document.getElementById('driverAge').value,
    phone: document.getElementById('driverPhone').value,
    address: document.getElementById('driverAddress').value,
    location: document.getElementById('driverLocation').value,
    registeredAt: new Date().toISOString()
  };

  // ✅ IMPORTANT: push() allows MULTIPLE drivers
  db.ref('drivers').push(driverData);

  alert("✅ Driver Registered Successfully");
  driverModal.hide();
});
// ---------------- ASSIGN DRIVER TO CONTAINER ----------------
document.addEventListener('click', e => {
  if (e.target.classList.contains('assignDriverBtn')) {
    const driverId = e.target.dataset.id;
    const driverName = e.target.dataset.name;
    const phone = e.target.dataset.phone;

    const assignment = {
      containerId: "CONT-001", // demo container
      driverId,
      driverName,
      phone,
      assignedAt: new Date().toISOString()
    };

    // Save to Firebase
    db.ref('activeAssignment').set(assignment);

    // Optional: update Active Driver box instantly
    const activeDriverBox = document.getElementById('activeDriver');
    if (activeDriverBox) {
      activeDriverBox.innerHTML = `
        <strong>🚚 Active Driver</strong><br>
        Name: ${driverName}<br>
        Phone: ${phone}<br>
        Container: ${assignment.containerId}
      `;
    }

    alert(`✅ ${driverName} assigned to container`);
  }
});


  // Thresholds
  const thresholds = JSON.parse(localStorage.getItem('customThresholds')) || {
    tempMax: 28,
    humidityMax: 80,
    vibrationMax: 2
  };
  document.getElementById('tempThreshold').value = thresholds.tempMax;
  document.getElementById('humidityThreshold').value = thresholds.humidityMax;
  document.getElementById('vibrationThreshold').value = thresholds.vibrationMax;

  // 🔹 UPDATED Save Thresholds button
  document.getElementById('saveThresholdsBtn').addEventListener('click', () => {
    thresholds.tempMax = parseFloat(document.getElementById('tempThreshold').value);
    thresholds.humidityMax = parseFloat(document.getElementById('humidityThreshold').value);
    thresholds.vibrationMax = parseFloat(document.getElementById('vibrationThreshold').value);

    // Save locally
    localStorage.setItem('customThresholds', JSON.stringify(thresholds));

    // Save to Firebase
    db.ref('thresholds').set({
      temp: thresholds.tempMax,
      humidity: thresholds.humidityMax,
      vibration: thresholds.vibrationMax
    }).then(() => {
      simulateAlert('✅ Thresholds saved to Firebase!', 'success');
    }).catch(err => {
      console.error(err);
      simulateAlert('❌ Failed to save thresholds to Firebase', 'danger');
    });
  });

  // Load thresholds from Firebase
  db.ref('thresholds').once('value').then(snapshot => {
    const t = snapshot.val();
    if (t) {
      thresholds.tempMax = t.temp;
      thresholds.humidityMax = t.humidity;
      thresholds.vibrationMax = t.vibration;

      document.getElementById('tempThreshold').value = thresholds.tempMax;
      document.getElementById('humidityThreshold').value = thresholds.humidityMax;
      document.getElementById('vibrationThreshold').value = thresholds.vibrationMax;
    }
  }).catch(err => console.error(err));

  // Alerts
  const alertsContainer = document.getElementById('alerts');
 function simulateAlert(message, type = 'warning') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  alertsContainer.prepend(alertDiv);

  // 🔊 PLAY SIREN
  playSiren();

  setTimeout(() => alertDiv.remove(), 10000);
}

 function playSiren() {
  if (!soundEnabled) return;   // ✅ THIS LINE IS THE FIX

  const siren = document.getElementById('alertBeep');
  if (!siren) return;

  siren.currentTime = 0;
  siren.play().catch(err => {
    console.log("Siren play failed:", err);
  });
}


// ---------------- ACTIVE DRIVER DISPLAY ----------------
const activeDriverBox = document.getElementById('activeDriver');

db.ref('activeAssignment').on('value', snapshot => {
  const d = snapshot.val();
  if (!d || !activeDriverBox) return;

  activeDriverBox.innerHTML = `
    <strong>🚚 Active Driver</strong><br>
    Name: ${d.driverName}<br>
    Phone: ${d.phone}<br>
    Container: ${d.containerId}
  `;
});

  
// ---------------- LOAD ALL DRIVERS ----------------
const driversTable = document.getElementById('driversTable');

db.ref('drivers').on('value', snapshot => {
  driversTable.innerHTML = "";
  snapshot.forEach(child => {
    const d = child.val();
    driversTable.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.phone}</td>
        <td>${d.location}</td>
        <td>
          <button 
            class="btn btn-sm btn-success assignDriverBtn"
            data-id="${child.key}"
            data-name="${d.name}"
            data-phone="${d.phone}">
            Assign
          </button>
        </td>
      </tr>
    `;
  });
});

// 🔹 DRIVER DETAILS MODAL FUNCTIONALITY
const driverDetailsModal = new bootstrap.Modal(document.getElementById('driverDetailsModal'));
const driverDetailsBtn = document.getElementById('driverDetailsBtn');
const driverDetailsContainer = document.getElementById('driverDetailsContainer');

driverDetailsBtn.addEventListener('click', () => {
  driverDetailsContainer.innerHTML = ''; // clear previous content

  db.ref('drivers').once('value').then(snapshot => {
    snapshot.forEach(child => {
      const d = child.val();
      driverDetailsContainer.innerHTML += `
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <img src="${d.driverPhoto || 'icons/driver.png'}" alt="Driver Photo" class="rounded-circle me-3" width="60" height="60">
                <div>
                  <h6 class="mb-0">${d.name}</h6>
                  <small>Age: ${d.age}</small>
                </div>
              </div>
              <p class="mb-1"><strong>Phone:</strong> ${d.phone}</p>
              <p class="mb-1"><strong>Address:</strong> ${d.address}</p>
              <p class="mb-1"><strong>License:</strong> ${d.licensePhoto ? `<a href="${d.licensePhoto}" target="_blank">View</a>` : 'N/A'}</p>
              <p class="mb-0"><strong>Location:</strong> ${d.location}</p>
            </div>
          </div>
        </div>
      `;
    });
  });

  driverDetailsModal.show();
});


  // Gradient Gauge Factory
  function createGauge(ctx, gradientColors, max, initialValue, unit) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradientColors.forEach(([pos, color]) => gradient.addColorStop(pos, color));

    return new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [initialValue, max - initialValue], backgroundColor: [gradient, 'rgba(220,220,220,0.2)'], borderWidth: 0 }] },
      options: { rotation: -90, circumference: 180, cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateRotate: true, animateScale: true } },
      plugins: [{
        id: 'centerText',
        beforeDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.restore();
          const fontSize = (height / 6).toFixed(2);
          ctx.font = `${fontSize}px Arial`;
          ctx.textBaseline = 'middle';
          const value = chart.data.datasets[0].data[0].toFixed(1);
          const text = `${value}${unit}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 1.4;
          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      }]
    });
  }

  // Gauges
 const tempGauge = createGauge(
  document.getElementById('temperatureGauge'),
  [[0, "rgba(255,0,0,1)"], [1, "rgba(255,200,0,1)"]],
  50,
  27,
  "°C"
);

  const humidityGauge = createGauge(document.getElementById('humidityGauge'), [[0, "rgba(0,123,255,1)"], [1, "rgba(0,200,150,1)"]], 100, 50, "%");
  const vibrationGauge = createGauge(document.getElementById('vibrationGauge'), [[0, "rgba(0,200,150,1)"], [1, "rgba(150,0,200,1)"]], 5, 0.5, " m/s²"); // max 5g


  // Historical Chart
  const dataCtx = document.getElementById('dataChart').getContext('2d');
  const dataChart = new Chart(dataCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Temperature (°C)', data: [], borderColor: "rgba(255,99,132,1)", borderWidth: 2, fill: false, tension: 0.3 },
        { label: 'Humidity (%)', data: [], borderColor: "rgba(54,162,235,1)", borderWidth: 2, fill: false, tension: 0.3 },
        { label: 'Vibration (m/s²)', data: [], borderColor: "rgba(75,192,192,1)", borderWidth: 2, fill: false, tension: 0.3 }
      ]
    },
    options: { responsive: true, interaction: { mode: 'index', intersect: false } }
  });

 // --------------------
// 🔹 Firebase Live Sensor Updates
const VIBRATION_SENSOR_MAX = 5000; // actual max sensor reading
const sensorRef = db.ref('sensors/current');

sensorRef.on('value', snapshot => {
  const data = snapshot.val();
  if (!data) return;

const temp = Number(data.temperature);
const humidity = Number(data.humidity);
const vibration = Number(data.vibration);

  // ---------------- Update Gauges ----------------
const tempVal = Math.min(Math.max(temp || 0, 0), 50);
const humidityVal = Math.min(Math.max(humidity || 0, 0), 100);
const vibrationVal = Math.min(Math.max(vibration || 0, 0), VIBRATION_SENSOR_MAX);


tempGauge.data.datasets[0].data[0] = tempVal;
tempGauge.data.datasets[0].data[1] = Math.max(50 - tempVal, 0);

tempGauge.update();

humidityGauge.data.datasets[0].data[0] = humidityVal;
humidityGauge.data.datasets[0].data[1] = Math.max(100 - humidityVal, 0);
humidityGauge.update();

vibrationGauge.data.datasets[0].data[0] = vibrationVal;
vibrationGauge.data.datasets[0].data[1] = Math.max(VIBRATION_SENSOR_MAX - vibrationVal, 0);
vibrationGauge.update();


  // ---------------- Update Historical Chart ----------------
  const now = new Date().toLocaleTimeString();
  dataChart.data.labels.push(now);
  dataChart.data.datasets[0].data.push(temp);
  dataChart.data.datasets[1].data.push(humidity);
  dataChart.data.datasets[2].data.push(vibration);

  // Keep last 20 points
  if (dataChart.data.labels.length > 20) {
    dataChart.data.labels.shift();
    dataChart.data.datasets.forEach(ds => ds.data.shift());
  }
  dataChart.update();

  // ---------------- Trigger Alerts ----------------
  if (temp > thresholds.tempMax) simulateAlert(`⚠️ Temp exceeded (${temp}°C)`, 'danger');
  if (humidity > thresholds.humidityMax) simulateAlert(`⚠️ Humidity exceeded (${humidity}%)`, 'danger');
  if (vibration > thresholds.vibrationMax) simulateAlert(`⚠️ Vibration exceeded (${vibration} m/s²)`, 'danger');
});



  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.setItem('loggedIn', 'false');
    window.location.href = 'login.html';
  });
});

// ---------------------------
// 🌍 Map code remains unchanged
