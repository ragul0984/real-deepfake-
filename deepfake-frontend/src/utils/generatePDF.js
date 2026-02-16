import jsPDF from "jspdf";

export const generateReport = (result) => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Header ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Deepfake Forensic Report", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 25, { align: "right" });

    // --- Summary Section ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Summary", 20, 60);

    // Verdict Box
    const verdictColor = result.verdict.toLowerCase().includes("ai") ? [239, 68, 68] : [34, 197, 94]; // Red or Green
    doc.setDrawColor(...verdictColor);
    doc.setFillColor(...verdictColor);
    doc.roundedRect(20, 70, pageWidth - 40, 30, 3, 3, "FD");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`Verdict: ${result.verdict}`, 30, 90);
    doc.text(`Confidence: ${result.confidence}%`, pageWidth - 30, 90, { align: "right" });

    // --- Detailed Reasons ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Forensic Details", 20, 120);

    let yPos = 135;
    if (result.reasons && result.reasons.length > 0) {
        result.reasons.forEach((reason) => {
            // Reason Title
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(51, 65, 85); // slate-700
            doc.text(reason.title, 20, yPos);

            // Score
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`${reason.score}% Impact`, pageWidth - 20, yPos, { align: "right" });

            yPos += 7;

            // Description (Word Wrap)
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105); // slate-600
            const splitText = doc.splitTextToSize(reason.description, pageWidth - 40);
            doc.text(splitText, 20, yPos);

            yPos += splitText.length * 6 + 10; // Adjust line height + margin
        });
    } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.text("No specific forensic anomalies detected.", 20, yPos);
    }

    // --- Footer ---
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Deepfake Detection System - Hackathon Edition", pageWidth / 2, pageHeight - 15, { align: "center" });

    // Save the PDF
    doc.save("deepfake_analysis_report.pdf");
};
