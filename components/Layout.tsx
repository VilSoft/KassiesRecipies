import React, { ReactNode } from 'react';
// import Navbar from './Navbar';

interface LayoutProps {
    children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen text-foreground">
            <div className="bg-blobs" aria-hidden="true">
                <div className="bg-blob-1" />
                <div className="bg-blob-2" />
                <div className="bg-blob-3" />
            </div>
            <main className="relative flex flex-col">
                {children}
            </main>
        </div>
    )
}

export default Layout
