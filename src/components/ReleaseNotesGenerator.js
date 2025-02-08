import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import 'bootstrap/dist/css/bootstrap.min.css';

const ReleaseNotesGenerator = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [summary, setSummary] = useState("");
  const [authorImages, setAuthorImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: "", author: "", dateRange: { start: "", end: "" } });

  const fetchReleaseNotes = async () => {
    if (!repoUrl) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/generate-release-notes-v3", { repoUrl, filters });
      const { notes, summary } = response.data;
      setReleaseNotes(notes);
      setSummary(summary);
      fetchAuthorImages();
    } catch (error) {
      console.error("Error fetching release notes", error);
      setReleaseNotes("Failed to generate release notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorImages = async () => {
    try {
      const repoPath = repoUrl.replace("https://github.com/", "");
      const commitsUrl = `https://api.github.com/repos/${repoPath}/commits?per_page=50`;

      const { data } = await axios.get(commitsUrl);
      const uniqueImages = Array.from(new Map(data.map(commit => [
        commit.author?.avatar_url,
        {
          name: commit.commit.author.name,
          avatar: commit.author?.avatar_url || "https://via.placeholder.com/40",
        }
      ])).values());
      setAuthorImages(uniqueImages);
    } catch (error) {
      console.error("Error fetching author images", error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = doc.internal.pageSize.width - margin * 2;

    // Title and Summary
    doc.setFontSize(16);
    doc.text("Release Notes", margin, margin);
    doc.setFontSize(12);
    let cursorY = margin + 10;
    const summaryLines = doc.splitTextToSize(summary, contentWidth);
    summaryLines.forEach((line) => {
      if (cursorY + 10 > pageHeight) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 10;
    });

    // Table of Contents
    doc.addPage();
    cursorY = margin;
    doc.setFontSize(14);
    doc.text("Table of Contents", margin, cursorY);
    cursorY += 10;
    releaseNotes.forEach((note, index) => {
      if (cursorY + 10 > pageHeight) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(`${index + 1}. ${note}`, margin, cursorY);
      cursorY += 10;
    });

    // Detailed Notes with Author Images
    releaseNotes.forEach((note, index) => {
      if (cursorY + 30 > pageHeight) {
        doc.addPage();
        cursorY = margin;
      }
      doc.addImage(authorImages[index]?.avatar || "", "JPEG", margin, cursorY, 20, 20);
      doc.text(note, margin + 25, cursorY + 10);
      cursorY += 30;
    });

    doc.save("release-notes.pdf");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">Release Notes Generator</h1>
          <div className="mb-3">
            <label htmlFor="repoUrl" className="form-label">GitHub Repository URL</label>
            <input
              type="text"
              id="repoUrl"
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <h4>Filters</h4>
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="type" className="form-label">Commit Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All</option>
                  <option value="feat">Features</option>
                  <option value="fix">Fixes</option>
                  <option value="chore">Chores</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="author" className="form-label">Author</label>
                <select
                  id="author"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All</option>
                  {authorImages.map((author, index) => (
                    <option key={index} value={author.name}>{author.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="dateRange" className="form-label">Date Range</label>
                <input
                  type="date"
                  name="dateRangeStart"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                  className="form-control mb-2"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  name="dateRangeEnd"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                  className="form-control"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <button
              onClick={fetchReleaseNotes}
              disabled={loading}
              className={`btn btn-primary ${loading ? "disabled" : ""}`}
            >
              {loading ? "Generating..." : "Generate Release Notes"}
            </button>
            {releaseNotes && (
              <button
                onClick={downloadPDF}
                className="btn btn-success"
              >
                Download PDF
              </button>
            )}
          </div>

          {summary && (
            <div className="alert alert-info">
              <h4>Summary</h4>
              <p>{summary}</p>
            </div>
          )}

          {releaseNotes && (
            <div className="alert alert-secondary">
              <h4>Detailed Release Notes</h4>
              <ul>
                {releaseNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {authorImages.length > 0 && (
            <div className="mt-4">
              <h4>Commit Authors</h4>
              <div className="row g-3">
                {authorImages.map((author, index) => (
                  <div key={index} className="col-3 text-center">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="img-thumbnail rounded-circle mb-2"
                      style={{ width: "80px", height: "80px" }}
                    />
                    <p className="small">{author.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesGenerator;
