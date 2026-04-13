import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cardNumber: '',
        cvv: '',
        expMonth: 'Month',
        expYear: 'Year'
    });

    // Generate Years for Dropdown (Current Year + 10)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);
    const months = [
        "01 - Jan", "02 - Feb", "03 - Mar", "04 - Apr", "05 - May", "06 - Jun",
        "07 - Jul", "08 - Aug", "09 - Sep", "10 - Oct", "11 - Nov", "12 - Dec"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple Validation
        if (!formData.cardNumber || !formData.cvv || formData.expMonth === 'Month' || formData.expYear === 'Year') {
            alert('Please fill in all payment details.');
            setLoading(false);
            return;
        }

        try {
            // SIMULATE API CALL
            await new Promise(resolve => setTimeout(resolve, 2000));
            onSuccess(); // Triggers the plan upgrade in parent
        } catch (err) {
            console.error("Payment failed", err);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!plan) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden font-sans">
                
                {/* --- 1. ORDER OVERVIEW HEADER --- */}
                <div className="bg-[#2C3E50] px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg uppercase tracking-wide">Order Overview</h3>
                    <div className="text-right">
                        <span className="text-xl font-bold">{plan.price}</span>
                        <span className="text-xs uppercase ml-1 opacity-80">{plan.period ? ' / MO' : ''}</span>
                    </div>
                </div>

                <div className="p-6">
                    {/* Payment Method Label */}
                    <div className="mb-6 border border-gray-200 rounded p-3 bg-gray-50 text-sm text-gray-600 font-medium uppercase tracking-wide">
                        Credit / Debit Card
                    </div>

                    <form onSubmit={handlePay} className="space-y-5">
                        
                        {/* Row 1: Names */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">First name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        placeholder="John" 
                                        className="w-full p-2.5 border border-gray-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                                        onChange={handleChange}
                                    />
                                    {formData.firstName && <Check size={16} className="absolute right-3 top-3 text-green-600" />}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Last name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        placeholder="Doe" 
                                        className="w-full p-2.5 border border-gray-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                                        onChange={handleChange}
                                    />
                                    {formData.lastName && <Check size={16} className="absolute right-3 top-3 text-green-600" />}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Card Number & CVV */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Card number</label>
                                <input 
                                    type="text" 
                                    name="cardNumber"
                                    placeholder="•••• •••• •••• ••••" 
                                    maxLength="19"
                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-sm font-mono"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">CVV</label>
                                <input 
                                    type="text" 
                                    name="cvv"
                                    placeholder="•••" 
                                    maxLength="4"
                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-sm text-center font-mono"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Row 3: Card Logos (Visual Simulation) */}
                        <div className="flex gap-2 opacity-80 py-1">
                            {['visa', 'mastercard', 'amex', 'discover', 'jcb'].map((card) => (
                                <div key={card} className="h-6 w-10 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase">
                                    {card}
                                </div>
                            ))}
                        </div>

                        {/* Row 4: Expiry Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Valid until</label>
                            <div className="grid grid-cols-2 gap-4">
                                <select 
                                    name="expMonth"
                                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm focus:border-green-500 outline-none cursor-pointer"
                                    onChange={handleChange}
                                    defaultValue="Month"
                                >
                                    <option disabled>Month</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>

                                <select 
                                    name="expYear"
                                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm focus:border-green-500 outline-none cursor-pointer"
                                    onChange={handleChange}
                                    defaultValue="Year"
                                >
                                    <option disabled>Year</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* --- FOOTER BUTTONS --- */}
                        <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="w-1/3 py-3 bg-[#2C3E50] text-white rounded font-bold text-sm hover:bg-[#34495E] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-2/3 py-3 bg-[#4CAF50] text-white rounded font-bold text-sm hover:bg-[#45a049] transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} /> Processing...
                                    </>
                                ) : (
                                    'Submit Payment'
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;