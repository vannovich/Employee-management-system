import React, { useEffect, useState } from "react";
import { dummyAdminDashboardData } from "../assets/assets";
import Loading from "../components/Loading";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(dummyAdminDashboardData);
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, []);

  if(loading) return <Loading/>
  if(!data) return <p className="text-center text-slate-500 py-12">Failed to load dashboard</p>
  if(data.role === "ADMIN"){
    return <div>admin dashboard</div>
  }else{
    return <div>employee dashboard</div>
  }
}

export default Dashboard;
