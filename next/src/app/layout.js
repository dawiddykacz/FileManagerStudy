import "./globals.css";
import init from "../lib/data/init";

let initalize = false

export default function RootLayout({ children }) {
  if(!initalize){
    initalize = true
    init()
  }

  return (
    <html lang="en">
      <body >
        <nav className="nav">
        <a href="/">Home</a>
        <a href="/upload">Upload</a>
        <a href="/filemanager">File Manager</a>
    </nav><div className="wrapper wrapper-center white-space-pre-line">
      {children}
    </div>
      </body>
    </html>
  );
}
