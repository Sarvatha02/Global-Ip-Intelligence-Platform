// src/components/SearchPage.jsx
import React, { useState } from "react";

// Simple country list (add more if needed)
const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
  "Singapore",
  "United Arab Emirates",
];

const SearchPage = () => {
  const [formData, setFormData] = useState({
    type: "patent",
    keyword: "",
    assignee: "",
    inventor: "",
    jurisdiction: "",
  });

  const [results, setResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Search filters:", formData);

    // Dummy data – backend will replace later
    const dummy = [
      {
        id: 1,
        title:
          "Sample " + (formData.type === "patent" ? "Patent" : "Trademark"),
        assignee: formData.assignee || "Assignee Name",
        inventor: formData.inventor || "Inventor Name",
        jurisdiction: formData.jurisdiction || "United States",
        type: formData.type,
      },
    ];
    setTimeout(() => {
      setResults(dummy);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">
        Search Patents & Trademarks
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search mode tabs */}
        <div className="flex gap-2">
          {["patent", "trademark"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type,
                }))
              }
              className={`px-3 py-1.5 text-sm rounded-full border ${
                formData.type === type
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {type === "patent" ? "Patents" : "Trademarks"}
            </button>
          ))}
        </div>

        {/* SEARCH FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
        >
          {/* Line 1: IP Type + Keyword */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                IP Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="patent">Patents</option>
                <option value="trademark">Trademarks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Line 2: Assignee + Inventor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assignee
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="Company or owner name"
                className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Inventor
              </label>
              <input
                type="text"
                name="inventor"
                value={formData.inventor}
                onChange={handleChange}
                placeholder="Inventor name"
                className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Line 3: Jurisdiction (country dropdown) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jurisdiction
            </label>
            <select
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Centered Search button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[160px] rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-6 py-2 text-sm font-medium text-white"
            >
              {isSubmitting ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Active filters summary */}
          {(formData.keyword ||
            formData.assignee ||
            formData.inventor ||
            formData.jurisdiction) && (
            <div className="pt-3 text-xs text-slate-600">
              <span className="font-medium mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.keyword && (
                  <span className="px-2 py-1 rounded-full bg-slate-100">
                    Keyword: {formData.keyword}
                  </span>
                )}
                {formData.assignee && (
                  <span className="px-2 py-1 rounded-full bg-slate-100">
                    Assignee: {formData.assignee}
                  </span>
                )}
                {formData.inventor && (
                  <span className="px-2 py-1 rounded-full bg-slate-100">
                    Inventor: {formData.inventor}
                  </span>
                )}
                {formData.jurisdiction && (
                  <span className="px-2 py-1 rounded-full bg-slate-100">
                    Jurisdiction: {formData.jurisdiction}
                  </span>
                )}
              </div>
            </div>
          )}
        </form>

        {/* RESULTS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-3">Results</h2>

          {isSubmitting ? (
            <p className="text-sm text-slate-500">Searching… please wait.</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-500">
              No results yet. Submit the form to see sample results. Later this
              will show real data from the backend.
            </p>
          ) : (
            <ul className="space-y-3">
              {results.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <div className="font-medium mb-1">{item.title}</div>
                  <div className="text-slate-600">
                    Type: {item.type.toUpperCase()} | Assignee:{" "}
                    {item.assignee} | Inventor: {item.inventor} | Jurisdiction:{" "}
                    {item.jurisdiction}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
