// src/PDFCanvas.js
import React from 'react';
import { Document, Page } from 'react-pdf';

const PDFCanvas = ({ pdfFile }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
      <Document file={pdfFile}>
        <Page pageNumber={1} width={window.innerWidth} />
      </Document>
    </div>
  );
};

export default PDFCanvas;
