"use client";

import CanvasComponent from "./canvas-component";
import { ClearDialog } from "./clear-dialog";
import DrawingSelection from "./drawing-selections";
// import { useUIstore } from "@/stores";
import { TopBar } from "./top-bar";
const Draw = () => {
    return (
      <div className='relative w-screen h-screen'>
        <TopBar className="fixed top-3 left-1/2 transform -translate-x-1/2 z-10"/>
        <ClearDialog/>
        <CanvasComponent/>
        <DrawingSelection/>
      </div>
    );
  };
  
export default Draw;