//C:\taifa-school-system-main\server\utils\htmlTemplate.js

/**
 * @param {number} score
 * @param {object} thresholds - { exceeding, meeting, approaching }
 * @returns {string} Performance level
 */
const getPerformanceLevel = (score, thresholds) => {
  const numericScore = Number(score);
  if (isNaN(numericScore) || !thresholds) return "N/A";

  const { exceeding, meeting, approaching } = thresholds;

  if (numericScore >= exceeding) return "EXCEEDING EXPECTATION";
  if (numericScore >= meeting) return "MEETING EXPECTATION";
  if (numericScore >= approaching) return "APPROACHING EXPECTATION";
  return "BELOW EXPECTATION";
};

/**
 * @param {string} level
 * @returns {string} Color hex
 */
const getPerformanceColor = (level) => {
  const colors = {
    "EXCEEDING EXPECTATION": "#34D399", // Green
    "MEETING EXPECTATION": "#60A5FA", // Blue
    "APPROACHING EXPECTATION": "#FBBF24", // Amber
    "BELOW EXPECTATION": "#FCA5A5", // Soft Red
  };
  return colors[level?.toUpperCase()] || "#999";
};

export const generateHTMLReport = ({
  name,
  admission_number,
  grade,
  subjects = [],
  overall = {},
  school = {},
  term = "N/A",
  examType = "N/A",
  thresholds = null, // New: passed in from controller
}) => {
  const {
    school_name = "Unnamed School",
    logo_url = "",
    academic_year = new Date().getFullYear(),
  } = school;

  const {
    year = academic_year,
    position = "N/A",
    total = 0,
    performance = "N/A",
    remark = "N/A",
  } = overall;
  
  //const maxMarks = subjects.length * 100 || 900;(this was returning 900 always even if scored subjects were less or more than 900)

  const scoredSubjectsCount = subjects.filter(
    (s) => typeof s.score === "number" && !isNaN(s.score)
  ).length;
  const maxMarks = scoredSubjectsCount * 100;

  const overallColor = getPerformanceColor(performance);

  const subjectsHTML = subjects
    .map((subject, index) => {
      const level = getPerformanceLevel(subject.score, thresholds);
      const color = getPerformanceColor(level);
      return `
        <tr style="background-color: ${index % 2 === 0 ? "#f9f9f9" : "white"};">
          <td style="padding: 8px 10px; border-bottom: 1px solid #e1e8ed;">
            ${subject.name}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e1e8ed;">
            ${subject.score ?? "N/A"}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e1e8ed; font-weight: bold; font-style: italic; color: ${color};">
            ${level}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Academic Report - ${name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${
          logo_url
            ? `<img src="${logo_url}" alt="School Logo" style="height: 80px; margin-bottom: 10px;" onerror="this.style.display='none'" />`
            : ""
        }
        <h1 style="color: #1a5276; margin: 5px 0;">${school_name}</h1>
        <h2 style="color: #2c3e50; margin: 5px 0; border-bottom: 2px solid #6CB4EE; display: inline-block; padding-bottom: 5px;">
          ACADEMIC REPORT FORM
        </h2>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #6CB4EE;">
        <div style="display: flex; justify-content: space-between; gap: 40px;">
          <div style="flex: 1;">
            <h3 style="color: #1a5276; margin: 0;">${name}</h3>
            <p><strong>Term:</strong> ${term}</p>
            <p><strong>Year:</strong> ${year}</p>
             <p style="color: #f8f9fa"><strong>Position:</strong>${position} </p>
          </div>
          <div style="flex: 1;">
            <h3 style="color: #1a5276; margin: 0;"><strong>ADM No:</strong> ${admission_number}</h3>
            <p><strong>Exam:</strong> ${examType}</p>
            <p><strong>Grade:</strong> ${grade}</p>
            <p><strong>Total Marks:</strong> ${total} out of ${maxMarks}</p>
          </div>
        </div>

        <div style="margin-top: 12px;">
          <p><strong>Performance:</strong>
            <span style="color: ${overallColor}; font-weight: bold;">
              ${performance}
            </span>
          </p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="background: linear-gradient(to right, #6CB4EE, #1a5276); color: white;">
            <th style="padding: 10px; text-align: left;">SUBJECT</th>
            <th style="padding: 10px; text-align: left;">MARKS %</th>
            <th style="padding: 10px; text-align: left;">PERFORMANCE LEVEL</th>
          </tr>
        </thead>
        <tbody>${subjectsHTML}</tbody>
      </table>

      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="flex: 2;">
          <div style="font-weight: bold; color: #1a5276; margin-bottom: 5px;">TEACHER'S REMARKS:</div>
          <div style="border: 1px dashed #6CB4EE; border-radius: 4px; padding: 10px; min-height: 100px;">${remark}</div>
        </div>
        <div style="flex: 1; text-align: right;">
          <div style="font-weight: bold; color: #1a5276;">HEAD TEACHER'S SIGNATURE</div>
          <div style="border-bottom: 1px solid #1a5276; display: inline-block; width: 200px; margin-top: 30px;"></div>
        </div>
      </div>
    </body>
    </html>
  `;
};
