var result; // Declare result variable in the global scope

const frames = document.getElementById("numFrames");
const inputString = document.getElementById("inputString");
const policy = document.getElementById("replacementPolicy");
const output = document.getElementById("output");
const generateGraphButton = document.getElementById("generateGraphButton");
const hideGraphButton = document.getElementById("hideGraphButton");
const showResultsButton = document.getElementById("showResultsButton");
const hideResultsButton = document.getElementById("hideResultsButton");
const chart = document.getElementById("chart");
const hitRate = document.getElementById("hitRate");
const totalFaults = document.getElementById("totalFaults");
const resultTable = document.getElementById("resultTable");
const tableBody = document.getElementById("replacementSequence");

// Hide detailed results and table by default
hideResultsButton.style.display = "none";
resultTable.style.display = "none";
hideGraphButton.style.display = "none";
chart.style.display = "none";

// Submit form button
document.getElementById("inputForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the page from refreshing on form submit

  // Retrieve user inputs
  let framesValue = parseInt(frames.value); // Cast it into an integer directly
  let inputStringValue = inputString.value;
  let policyValue = policy.value;

  // Split input string into an array of page numbers
  let pages = inputStringValue.trim().split(/\s+/);

  // Perform page replacement logic based on the selected policy
  result = performReplacement(pages, framesValue, policyValue); // Store the result in the global variable

  // Display the results
  displayResults(result);
  generateGraph()
});

// Reset form button
document.getElementById("resetButton").addEventListener("click", function () {
  frames.value = "";
  inputString.value = "";
  policy.value = "";
  output.style.display = "none";
  resultTable.style.display = "none";
  hideGraphButton.style.display = "none";
  chart.getContext("2d").clearRect(0, 0, chart.width, chart.height);
});

// Show detailed results
showResultsButton.addEventListener("click", function () {
  showResultsButton.style.display = "none";
  hideResultsButton.style.display = "block";
  resultTable.style.display = "table";
});

// Hide detailed results
hideResultsButton.addEventListener("click", function () {
  showResultsButton.style.display = "block";
  hideResultsButton.style.display = "none";
  resultTable.style.display = "none";
});

// Generate graph
generateGraphButton.addEventListener("click", function () {
  generateGraphButton.style.display = "none";
  hideGraphButton.style.display = "block";
  chart.style.display = "block";
});

// Hide graph
hideGraphButton.addEventListener("click", function () {
  generateGraphButton.style.display = "block";
  hideGraphButton.style.display = "none";
  chart.style.display = "none";
});

// Perform page replacement logic based on the selected policy
function performReplacement(pages, framesValue, policyValue) {
  let frameTable = new Array(framesValue).fill(null);
  let hits = 0;
  let faults = 0;
  let result = [];

  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    if (frameTable.includes(page)) {
      hits++;
      result.push({ page: page, hit: true });
    } else {
      faults++;
      let replacementIndex = -1;

      if (frameTable.includes(null)) {
        replacementIndex = frameTable.indexOf(null);
      } else {
        if (policyValue === "optimal") {
          replacementIndex = getOptimalReplacementIndex(pages, i, frameTable);
        } else if (policyValue === "lru") {
          replacementIndex = getLRUReplacementIndex(frameTable);
        } else if (policyValue === "fifo") {
          replacementIndex = getFIFOReplacementIndex(frameTable);
        }
      }

      frameTable[replacementIndex] = page;
      result.push({ page: page, hit: false });
    }
  }

  let hitRate = (hits / pages.length) * 100;
  return {
    result: result,
    hits: hits,
    faults: faults,
    hitRate: hitRate.toFixed(2)
  };
}

// Get the index of the optimal page to replace
function getOptimalReplacementIndex(pages, currentIndex, frameTable) {
  let farthestIndex = -1;
  let farthestDistance = -1;

  for (let i = 0; i < frameTable.length; i++) {
    let page = frameTable[i];
    let distance = pages.slice(currentIndex).findIndex(function (p) {
      return p === page;
    });

    if (distance === -1) {
      return i;
    }

    if (distance > farthestDistance) {
      farthestDistance = distance;
      farthestIndex = i;
    }
  }

  return farthestIndex;
}

// Get the index of the least recently used page to replace
function getLRUReplacementIndex(frameTable) {
  let leastRecentIndex = 0;
  let leastRecentTime = frameTable[0].time;

  for (let i = 1; i < frameTable.length; i++) {
    if (frameTable[i].time < leastRecentTime) {
      leastRecentTime = frameTable[i].time;
      leastRecentIndex = i;
    }
  }

  return leastRecentIndex;
}

// Get the index of the first page in the frame table (FIFO replacement)
function getFIFOReplacementIndex(frameTable) {
  return 0;
}

// Display the results
function displayResults(result) {
  hitRate.textContent = result.hitRate + '%';
  totalFaults.textContent = result.faults;

  tableBody.innerHTML = "";

  for (let i = 0; i < result.result.length; i++) {
    let row = document.createElement("tr");
    let pageCell = document.createElement("td");
    let hitFaultCell = document.createElement("td");

    pageCell.textContent = result.result[i].page;

    if (result.result[i].hit) {
      hitFaultCell.textContent = 'Hit';
      hitFaultCell.classList.add('hit')
    } else {
      hitFaultCell.textContent = 'Fault';
      hitFaultCell.classList.add('fault')
    }

    row.appendChild(pageCell);
    row.appendChild(hitFaultCell);
    tableBody.appendChild(row);
  }

  output.style.display = "block";
  resultTable.style.display = "none";
  hideGraphButton.style.display = "none";
}

// Generate the graph
function generateGraph() {
  let labels = [];
  let data = [];

  for (let i = 0; i < result.result.length; i++) {
    labels.push(result.result[i].page);
    data.push(result.result[i].hit ? 1 : 0);
  }

  let ctx = chart.getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Hit",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
