import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

const ReleaseNotesGenerator = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [authorImages, setAuthorImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReleaseNotes = async () => {
    if (!repoUrl) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/generate-release-notes", { repoUrl });
      setReleaseNotes(response.data.notes);
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
        commit.author?.avatar_url, // Key for uniqueness
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

    doc.setFontSize(16);
    doc.text("Release Notes", margin, margin);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(releaseNotes, contentWidth);
    let cursorY = margin + 10;

    lines.forEach((line) => {
      if (cursorY + 10 > pageHeight) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 10;
    });

    doc.save("release-notes.pdf");
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

          {releaseNotes && (
            <div className="alert alert-secondary">
              <h4>Generated Release Notes</h4>
              <pre>{releaseNotes}</pre>
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
