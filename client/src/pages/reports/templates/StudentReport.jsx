import { calculatePerformance } from "../../../utils/performanceCalculator";

export default function StudentReport({ student }) {
  return (
    <div
      className="report"
      style={{
        fontFamily: "Arial",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#1a5276", textAlign: "center" }}>
        TAIFA SCHOOL REPORT CARD
      </h1>

      {student && (
        <div>
          <h2>{student.name}</h2>
          <p>Admission: {student.admission_number}</p>
          <p>Grade: {student.grade}</p>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              margin: "20px 0",
              borderRadius: "5px",
            }}
          >
            <h3>Performance: {calculatePerformance(student.total_marks)}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
