import React, { useState, useEffect } from "react";
import client from "../api/client";
import { PenTool, Lock, Info } from "lucide-react"; 

const NewFilingPage = ({ user }) => {
  
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const userPlan = currentUser?.planType || 'STARTUP';

  const PLAN_LIMITS = {
    'STARTUP': 1,
    'PRO': 5,
    'ENTERPRISE': Infinity
  };

  const limitMax = PLAN_LIMITS[userPlan] || 1;
  const [currentUsage, setCurrentUsage] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    filingType: "",
    inventorName: "",
    email: "", 
    assignee: currentUser?.name || "", 
    filingDate: "",
    expirationDate: "", 
    jurisdiction: "",
    applicationNumber: "", 
    patentNumber: "", 
    patentStatus: "Pending", 
    description: "",
    tags: "",
  });

  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const res = await client.get("/tracker/all");
        const userFilings = Array.isArray(res.data) 
          ? res.data.filter(f => f.userId === currentUser.id || f.ownerId === currentUser.id) 
          : [];
        
        setCurrentUsage(userFilings.length);
      } catch (err) {
        console.error("Failed to check filing limits:", err);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (currentUser.id) checkUsage();
    else setLoadingUsage(false);
  }, [currentUser.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({});

    if (userPlan !== 'ENTERPRISE' && currentUsage >= limitMax) {
        setAlert({
            type: "error",
            message: `🚫 Plan Limit Reached! You have used ${currentUsage}/${limitMax} filings. Upgrade to 'IP Professional' or 'Enterprise' to file more.`
        });
        window.scrollTo(0, 0);
        return;
    }

    console.log("Sending Data:", formData);

    try {
      await client.post("/filings", formData);

      setAlert({ type: "success", message: "Patent Filing Submitted Successfully!" });
      
      setCurrentUsage(prev => prev + 1);

      setFormData({
        title: "",
        category: "",
        filingType: "",
        inventorName: "",
        email: "",
        assignee: currentUser?.name || "",
        filingDate: "",
        expirationDate: "",
        jurisdiction: "",
        applicationNumber: "",
        patentNumber: "", 
        patentStatus: "Pending",
        description: "",
        tags: "",
      });
      window.scrollTo(0, 0);

    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Filing submission failed. Check console.",
      });
      console.error("Submission Error:", err.response?.data);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-xl p-10 rounded-2xl border border-gray-100 relative">
      
      <div className="absolute top-6 right-8 flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
         <div className={`p-1.5 rounded-full ${currentUsage >= limitMax && userPlan !== 'ENTERPRISE' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {currentUsage >= limitMax && userPlan !== 'ENTERPRISE' ? <Lock size={14} /> : <Info size={14} />}
         </div>
         <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filing Quota</p>
            <p className={`text-xs font-bold ${currentUsage >= limitMax && userPlan !== 'ENTERPRISE' ? 'text-red-600' : 'text-slate-800'}`}>
                {userPlan === 'ENTERPRISE' ? 'Unlimited' : `${currentUsage} / ${limitMax} Used`}
            </p>
         </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        New Patent Filing
      </h1>

      {alert.message && (
        <div
          className={`p-4 mb-6 text-center rounded-xl border flex items-center justify-center gap-2 font-bold ${
            alert.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {alert.message}
        </div>
      )}

      <fieldset disabled={userPlan !== 'ENTERPRISE' && currentUsage >= limitMax} className={`space-y-6 transition-opacity ${userPlan !== 'ENTERPRISE' && currentUsage >= limitMax ? 'opacity-50' : 'opacity-100'}`}>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-600">Patent Title</label>
                <input
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the official title of the invention"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                />
            </div>
            
            <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    Official Patent Number <PenTool size={12} className="text-gray-400"/> 
                    <span className="text-xs font-normal text-gray-400 ml-2">(Enter if already granted)</span>
                </label>
                <input
                type="text"
                id="patentNumber"
                value={formData.patentNumber}
                onChange={handleChange}
                placeholder="e.g. US11223344B2 (Optional)"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Category</label>
                <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                >
                <option value="">Select Category</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Biotech">Biotech</option>
                <option value="Software">Software</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Chemical">Chemical / Pharma</option>
                <option value="Design">Industrial Design</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Type of Filing</label>
                <select
                id="filingType"
                value={formData.filingType}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                >
                <option value="">Select Type</option>
                <option value="Provisional">Provisional Application</option>
                <option value="Complete">Non-Provisional (Complete)</option>
                <option value="PCT">PCT International</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Inventor Name</label>
                <input
                id="inventorName"
                value={formData.inventorName}
                onChange={handleChange}
                placeholder="Primary Inventor"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Contact Email</label>
                <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="inventor@example.com"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Assignee (Owner)</label>
                <input
                type="text"
                id="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="Company or Individual Name"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Jurisdiction</label>
                <select
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                >
                <option value="">Select Region</option>
                <option value="IN">India (IN)</option>
                <option value="US">United States (US)</option>
                <option value="EU">Europe (EU)</option>
                <option value="CN">China (CN)</option>
                <option value="JP">Japan (JP)</option>
                <option value="WO">World (PCT)</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Filing Date</label>
                <input
                type="date"
                id="filingDate"
                value={formData.filingDate}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Est. Expiration Date</label>
                <input
                type="date"
                id="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Application No.</label>
                <input
                type="text"
                id="applicationNumber"
                value={formData.applicationNumber}
                onChange={handleChange}
                placeholder="e.g. 202411001234"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Current Status</label>
                <select
                id="patentStatus"
                value={formData.patentStatus}
                onChange={handleChange}
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                <option value="Pending">Pending</option>
                <option value="Under Examination">Under Examination</option>
                <option value="Granted">Granted</option>
                <option value="Rejected">Rejected</option>
                </select>
            </div>

            </div>

            <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm font-semibold text-gray-600">Abstract / Description</label>
            <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the invention in detail..."
                className="input-box h-28 border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                required
            ></textarea>
            </div>

            <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Tags</label>
            <input
                id="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="ai, machine learning, cloud"
                className="input-box border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            </div>

            <button 
                type="submit" 
                className={`w-full py-3 rounded-xl text-lg font-semibold transition shadow-md ${
                    userPlan !== 'ENTERPRISE' && currentUsage >= limitMax 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
                {userPlan !== 'ENTERPRISE' && currentUsage >= limitMax ? "Limit Reached" : "Submit Patent Filing"}
            </button>
        </form>
      </fieldset>
    </div>
  );
};

export default NewFilingPage;