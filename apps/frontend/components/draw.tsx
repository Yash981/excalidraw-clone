"use client";

import CanvasComponent from "./canvas-component";
import { ClearDialog } from "./clear-dialog";
import Collaboration from "./collaboration";
import DrawingSelection from "./drawing-selections";
import { TopBar } from "./top-bar";
import ZoomCanvas from "./zoom-canvas";
const Draw = () => {
    return (
      <div className='relative w-screen h-screen'>
        <TopBar className="fixed top-3 left-1/2 transform -translate-x-1/2 z-10"/>
        <div className="z-10 relative">
        <Collaboration/>
        </div>
        <ClearDialog/>
        <CanvasComponent/>
        <DrawingSelection/>
        <ZoomCanvas/>
      </div>
    );
  };
  
export default Draw;