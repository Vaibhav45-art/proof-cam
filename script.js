const imageInput = document.getElementById("imageInput");
const scanBtn = document.getElementById("scanBtn");
const downloadBtn = document.getElementById("downloadBtn");
const outputText = document.getElementById("outputText");
const previewImg = document.getElementById("previewImg");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      previewImg.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

scanBtn.onclick = () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please upload an image of a document.");
    return;
  }

  outputText.textContent = "Scanning... please wait ⏳";

  Tesseract.recognize(
    file,
    'eng',
    {
      logger: m => console.log(m)
    }
  ).then(({ data: { text } }) => {
    outputText.textContent = text || "No readable text found.";
    downloadBtn.disabled = false;

    // Fraud detection logic
    const fraudPatterns = ["seal not visible", "signature mismatch", "font changed", "xxx", "edited", "tampered"];
    const lowerText = text.toLowerCase();
    let fraudFound = false;

    fraudPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        fraudFound = true;
      }
    });

    if (fraudFound) {
      alert("⚠️ Warning: Possible tampering or fake document detected!");
    }

    // Download feature
    downloadBtn.onclick = () => {
      const blob = new Blob([outputText.textContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "scan-result.txt";
      link.click();
    };
  }).catch(error => {
    outputText.textContent = "Error scanning image.";
    console.error(error);
  });
};
