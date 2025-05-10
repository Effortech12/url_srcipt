'use client';
import { useState } from 'react';
//import { FiCheckCircle, FiSend, FiUpload, FiDownload } from 'react-icons/fi';
import { FiDownload } from 'react-icons/fi';


type CheckResult = {
  url: string;
  alias: string;
  status: string;
  responseCode: number;
  reason: string;
  time: string;
};


export default function CheckerPage() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // const [inputUrl, setInputUrl] = useState('');
  const [singleResult, setSingleResult] = useState<CheckResult | null>(null); // To store single URL result
  const [bulkResults, setBulkResults] = useState<CheckResult[]>([]); // To store bulk URL results
  const [emailStatus, setEmailStatus] = useState('');
  //const [modalOpen, setModalOpen] = useState(false);
  //const [status, setStatus] = useState('');

  //const [result, setResult] = useState<any>(null);
const handleSingleCheck = async () => {
    if (!url || !alias) {
      alert('Please provide both URL and alias');
      return;
    }

    setLoading(true);
    setMessage('');
    //setResult(null); // reset previous result
    setSingleResult(null);

    const res = await fetch('/api/check-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, alias })
    });

    const data = await res.json();
    
     if (data.result) {
   // setResult(data.result); // ← store the result object
    //setMessage('Check completed successfully!');
    setSingleResult(data.result);
    setMessage(data.message || data.error || 'Something went wrong');
    setEmailStatus(data.emailSent ? `✅ Email sent to ${process.env.NEXT_PUBLIC_EMAIL_TO}` : '❌ Email sending failed');

   } else {
    setMessage(data.error || 'Something went wrong');
}
setLoading(false);
};

  const handleBulkUpload = async (file: File) => {
    // if (!file) {
    //   alert('Please select a file first.');
    //   return;
    // }

    // setLoading(true);
    // setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/check-urls', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.results) {
    setBulkResults(data.results); // Set bulk upload results
    //setMessage('Check completed successfully!');
    setMessage(data.message || data.error || 'Something went wrong');
    setEmailStatus(data.emailSent ? `✅ Email sent to ${process.env.NEXT_PUBLIC_EMAIL_TO}` : '❌ Email sending failed');
    //setLoading(false);
    // setMessage(data.message || data.error || 'Something went wrong');
    // setLoading(false);
  } else {
    setMessage(data.error || 'Something went wrong');
  }

  setLoading(false);
  };
  const handleDownloadReport = () => {
    window.location.href = '/api/download-report';
  };
  
  return (
    <div className="w-full bg-black text-white min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 text-center">🚀 URL Script Dashboard</h1>
  
        {/* Animated message */}
        {message && (
          <p className="text-center text-orange-300 font-medium animate-pulse mb-8">{message}</p>
        )}
  
        {/* Single URL Checker */}
        <div className="bg-gray-900 border border-orange-600 p-6 rounded-2xl shadow-xl mb-8">
          <h2 className="text-2xl text-orange-400 font-semibold mb-4">🔍 Check Single URL</h2>
          <input
            className="mb-4 p-3 w-full rounded-lg bg-black border border-orange-400 placeholder-gray-400"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className="mb-4 p-3 w-full rounded-lg bg-black border border-orange-400 placeholder-gray-400"
            placeholder="Enter alias (e.g. 'Shivalik Bank')"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
            onClick={handleSingleCheck}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Single URL'}
          </button>
          {emailStatus && <p className="mt-2 text-green-500">{emailStatus}</p>}
          <button
          onClick={handleDownloadReport}
          className="flex items-center mt-4 font-semibold justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
        >
          <FiDownload /> Download Report
        </button>
          {singleResult && (
            <div className="mt-4 p-4 rounded-lg border border-orange-500 bg-gray-800">
              <h3 className="text-lg font-bold text-orange-300">Result:</h3>
              {Object.entries(singleResult).map(([key, val]) => (
                <p key={key}><strong>{key}:</strong> {String(val)}</p>
              ))}
            </div>
          )}
         
        </div>
  
        {/* Bulk Upload Section */}
        <div className="bg-gray-900 border border-orange-600 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl text-orange-400 font-semibold mb-4">📁 Bulk Upload Checker</h2>
          <div className="border-2 border-dashed border-orange-400 p-6 rounded-lg text-center mb-4">
            <input
              type="file"
              className="hidden"
              accept=".txt,.json,.pdf.excel,.xml"
              id="fileUpload"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="fileUpload" className="cursor-pointer block">
              <p className="text-orange-300 mb-2">Click or drag to upload</p>
              <span className="inline-block bg-orange-500 hover:bg-orange-600 font-semibold text-white px-4 py-2 rounded">Browse Files</span>
            </label>
          </div>
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg"
            onClick={() => file && handleBulkUpload(file)}
            disabled={loading || !file}
          >
            {loading ? 'Checking...' : 'Check Bulk URLs'}
          </button>
          {emailStatus && <p className="mt-2 text-green-500">{emailStatus}</p>}
          <button
          onClick={handleDownloadReport}
          className="flex items-center mt-4 font-semibold justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
        >
          <FiDownload /> Download Report
        </button>
          {bulkResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-orange-300 mb-2">Bulk Upload Results:</h3>
              {bulkResults.map((res, i) => (
                <div key={i} className="mt-2 p-4 border border-orange-500 bg-gray-800 rounded-lg">
                  {Object.entries(res).map(([key, val]) => (
                    <p key={key}><strong>{key}:</strong> {String(val)}</p>
                  ))}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}