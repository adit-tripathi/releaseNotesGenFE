import React, { useState } from "react";
import axios from "axios";

const ReleaseNotesGenerator = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReleaseNotes = async () => {
    if (!repoUrl) return;
    setLoading(true);
    try {
      const response = await axios.post("https://release-notes-backend.onrender.com/api/generate-release-notes", { repoUrl });
      setReleaseNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching release notes", error);
      setReleaseNotes("Failed to generate release notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Automated Release Notes Generator</h2>
      <input
        placeholder="Enter GitHub Repository URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="mb-4 border p-2 rounded w-full"
      />
      <button onClick={fetchReleaseNotes} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
        {loading ? "Generating..." : "Generate Release Notes"}
      </button>
      {releaseNotes && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h3 className="font-semibold mb-2">Generated Release Notes:</h3>
          <pre className="whitespace-pre-wrap">{releaseNotes}</pre>
        </div>
      )}
    </div>
  );
};

export default ReleaseNotesGenerator;