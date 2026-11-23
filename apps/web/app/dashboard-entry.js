'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Activity from './activity';
import Manage from './manage';
import Profile from './profile';
import Business from './business';
import DashboardShell from './dashboard-shell';
const components={activity:Activity,posts:Manage,profile:Profile,business:Business};
export default function DashboardEntry({section}){const [token,setToken]=useState(null);useEffect(()=>setToken(localStorage.getItem('ks-token')||''),[]);const Component=components[section];if(token===null)return <div className="workspace-loading">Loading your workspace…</div>;if(!token)return <DashboardShell section={section} title="Welcome back" description="Sign in to see your personal workspace."><p>Please sign in to access your dashboard.</p><Link href="/" className="button dark">Go to marketplace</Link></DashboardShell>;return <Component token={token}/>}
