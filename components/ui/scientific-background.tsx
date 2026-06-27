'use client'

import { motion } from 'framer-motion'

export function ScientificBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-white" />
      <motion.div className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-green-100/10 blur-3xl" style={{top:'5%',left:'5%'}}
        animate={{y:[0,30,0],scale:[1,1.05,1],opacity:[0.4,0.6,0.4]}} transition={{duration:20,repeat:Infinity,ease:'easeInOut'}} />
      <motion.div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-green-primary/15 to-transparent blur-3xl" style={{top:'60%',right:'10%'}}
        animate={{y:[0,-25,0],opacity:[0.5,0.3,0.5]}} transition={{duration:15,repeat:Infinity,delay:2}} />
      {[...Array(8)].map((_,i)=>(
        <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-green-primary/30" style={{top:`${15+i*10}%`,left:`${10+i*12}%`}}
          animate={{y:[0,-12,0],opacity:[0.3,0.6,0.3]}} transition={{duration:8+i,repeat:Infinity,delay:i*0.3}} />
      ))}
      <motion.div className="absolute w-3 h-3 rounded-full bg-green-primary shadow-[0_0_20px_rgba(34,197,94,0.5)]" style={{top:'20%',left:'25%'}}
        animate={{scale:[1,1.5,1],opacity:[0.6,1,0.6]}} transition={{duration:3,repeat:Infinity}} />
    </div>
  )
}