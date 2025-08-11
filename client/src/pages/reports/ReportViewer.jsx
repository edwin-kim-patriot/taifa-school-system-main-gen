//C:\taifa-school-system-main\client\src\pages\reports\ReportViewer.jsx
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ReportTemplate from "./templates/ReportTemplate";

export default function ReportViewer() {
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  return (
    <div>
      <button onClick={handlePrint}>Generate PDF</button>
      <div ref={reportRef}>
        <ReportTemplate />
      </div>
    </div>
  );
}
