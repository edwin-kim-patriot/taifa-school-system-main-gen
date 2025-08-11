//C:\taifa-school-system-main\client\src\pages\reports\templates\ReportTemplate.jsx
import { useEffect, useState } from "react";
import { useSchoolSettings } from "../../../hooks/useSchoolSettings";
import { fetchGradingSettings } from "../../../api/settings";

export default function ReportTemplate({ student }) {
  const {
    schoolName = "Unnamed School",
    academicYear = new Date().getFullYear(),
    logoUrl = "",
  } = useSchoolSettings();

  const [thresholds, setThresholds] = useState(null);

  useEffect(() => {
    const loadGrading = async () => {
      try {
        const data = await fetchGradingSettings();
        setThresholds(data.thresholds);
      } catch (err) {
        console.error("Failed to fetch grading thresholds", err);
      }
    };
    loadGrading();
  }, []);

  function getPerformanceColor(level = "") {
    const normalized = level.toUpperCase();
    switch (normalized) {
      case "EXCEEDING EXPECTATION":
        return "#34D399";
      case "MEETING EXPECTATION":
        return "#60A5FA";
      case "APPROACHING EXPECTATION":
        return "#FBBF24";
      case "BELOW EXPECTATION":
        return "#FCA5A5";
      default:
        return "#555";
    }
  }

  function getSubjectPerformanceColor(score) {
    if (!thresholds || typeof score !== "number") return "#999"; // visually indicates missing thresholds

    const { exceeding, meeting, approaching } = thresholds;

    if (exceeding == null || meeting == null || approaching == null) {
      console.warn("Grading thresholds are incomplete:", thresholds);
      return "#999";
    }

    if (score >= exceeding) return "#34D399";
    if (score >= meeting) return "#60A5FA";
    if (score >= approaching) return "#FBBF24";
    return "#FCA5A5";
  }

  if (!student) return <div>No student selected</div>;

  const {
    name = "N/A",
    term = "N/A",
    examType = "N/A",
    year,
    grade = "N/A",
    admission_number = "N/A",
    overall = {},
    subjects = [],
  } = student;

  const {
    position = "N/A",
    total = 0,
    performance = "N/A",
    remark = "N/A",
  } = overall;

  const displayYear = year || academicYear;
  //const maxMarks = subjects.length * 100 || 900;(this was returning 900 always even if scored subjects were less or more than 900)
  const scoredSubjectsCount = subjects.filter(
    (s) => typeof s.score === "number" && !isNaN(s.score)
  ).length;
  const maxMarks = scoredSubjectsCount * 100;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="School Logo"
            style={{ height: "80px", marginBottom: "10px" }}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <h1 style={{ color: "#1a5276", margin: "5px 0" }}>{schoolName}</h1>
        <h2
          style={{
            color: "#2c3e50",
            margin: "5px 0",
            borderBottom: "2px solid #6CB4EE",
            display: "inline-block",
            paddingBottom: "5px",
          }}
        >
          ACADEMIC REPORT FORM
        </h2>
      </div>

      {/* Student Info */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          borderLeft: "4px solid #6CB4EE",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#1a5276", margin: 0 }}>{name}</h3>
            <p style={{ margin: "6px 0" }}>
              <strong>TERM:</strong> {term}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>YEAR:</strong> {displayYear}
            </p>
            <p style={{ margin: "6px 0", color: "#f8f9fa" }}>
              <strong>POSITION:</strong> {position}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#1a5276", margin: 0 }}>
              <strong>ADM NO:</strong> {admission_number}
            </h3>
            <p style={{ margin: "6px 0" }}>
              <strong>EXAM:</strong> {examType}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>GRADE:</strong> {grade}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>TOTAL MARKS:</strong> {total} out of {maxMarks}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: "6px 0" }}>
            <strong>PERFORMANCE:</strong>{" "}
            <span
              style={{
                color: getPerformanceColor(performance),
                fontWeight: "bold",
              }}
            >
              {performance}
            </span>
          </p>
        </div>
      </div>

      {/* Subjects Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "25px",
        }}
      >
        <thead>
          <tr
            style={{
              background: "linear-gradient(to right, #6CB4EE, #1a5276)",
              color: "white",
            }}
          >
            <th style={{ padding: "10px", textAlign: "left" }}>SUBJECT</th>
            <th style={{ padding: "10px", textAlign: "left" }}>MARKS %</th>
            <th style={{ padding: "10px", textAlign: "left" }}>
              PERFORMANCE LEVEL
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <tr
                key={subject.name}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                }}
              >
                <td
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid #e1e8ed",
                  }}
                >
                  {subject.name}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid #e1e8ed",
                  }}
                >
                  {subject.score ?? "N/A"}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid #e1e8ed",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: getSubjectPerformanceColor(subject.score),
                  }}
                >
                  {subject.performance || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  padding: "15px",
                  color: "#888",
                }}
              >
                No subject data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <div style={{ flex: 2 }}>
          <div
            style={{
              fontWeight: "bold",
              color: "#1a5276",
              marginBottom: "5px",
            }}
          >
            TEACHER'S REMARKS:
          </div>
          <div
            style={{
              border: "1px dashed #6CB4EE",
              borderRadius: "4px",
              padding: "10px",
              minHeight: "50px",
            }}
          >
            {remark}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{
              fontWeight: "bold",
              color: "#1a5276",
            }}
          >
            HEAD TEACHER'S SIGNATURE
          </div>
          <div
            style={{
              borderBottom: "1px solid #1a5276",
              display: "inline-block",
              width: "200px",
              marginTop: "30px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
