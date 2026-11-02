
import { useState } from "react";
import { Upload, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "../styles/ImportLeads.css";

const ImportLeads = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel or CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post(
        "/leads/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(response.data);

    } catch (err) {
      setError(
        err.response?.data?.message || "Import failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-leads-page">

      <button
        className="back-leads"
        onClick={() => navigate("/leads")}
      >
        <ArrowLeft size={17} /> Back to Leads
      </button>

      <h1>Import Leads</h1>
      <p>Upload your Excel or CSV customer database.</p>

      <div className="import-card">

        <div className="import-icon">
          <FileSpreadsheet size={34} />
        </div>

        <h2>Upload your lead file</h2>

        <p>
          Supported formats: XLSX, XLS, CSV. Maximum size: 5 MB.
        </p>

        <label className="file-select">
          <Upload size={18} />
          Choose File

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
              setError("");
            }}
            hidden
          />
        </label>

        {file && (
          <div className="selected-file">
            {file.name}
          </div>
        )}

        {error && (
          <div className="import-error">{error}</div>
        )}

        <button
          className="import-submit"
          onClick={handleImport}
          disabled={loading || !file}
        >
          {loading ? "Importing..." : "Import Leads"}
        </button>

        <div className="import-format">
          <strong>Excel column format</strong>

          <code>name | phone | email | company</code>
        </div>

      </div>

      {result && (
        <div className="import-result">

          <h3>Import Report</h3>

          <div className="import-result-grid">
            <div>
              <span>Total Rows</span>
              <strong>{result.summary.totalRows}</strong>
            </div>

            <div>
              <span>Imported</span>
              <strong>{result.summary.imported}</strong>
            </div>

            <div>
              <span>Duplicates</span>
              <strong>{result.summary.duplicates}</strong>
            </div>

            <div>
              <span>Invalid</span>
              <strong>{result.summary.invalid}</strong>
            </div>
          </div>

          <button
            onClick={() => navigate("/leads")}
          >
            View Leads
          </button>

        </div>
      )}

    </div>
  );
};

export default ImportLeads;
