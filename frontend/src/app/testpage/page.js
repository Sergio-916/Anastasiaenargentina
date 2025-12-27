
'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTours() {
            try {
                const res = await fetch('/api/test');
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await res.json();
                setTours(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTours();
    }, []);

    if (loading) return <div className="p-10">Loading tours...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Tours Table</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Cost</th>
                            <th className="py-2 px-4 border-b">Duration (min)</th>
                            <th className="py-2 px-4 border-b">Meeting Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tours.map((tour) => (
                            <tr key={tour.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b text-center">{tour.id}</td>
                                <td className="py-2 px-4 border-b font-medium">{tour.name}</td>
                                <td className="py-2 px-4 border-b">{tour.cost}</td>
                                <td className="py-2 px-4 border-b text-center">{tour.duration}</td>
                                <td className="py-2 px-4 border-b">{tour.meeting_point}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
