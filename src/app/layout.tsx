import type {Metadata} from 'next';
import './globals.css';
import {DarkModeProvider} from './components/DarkModeProvider';
import Header from './components/Header';
import React from 'react';

export const metadata: Metadata = {
    title: 'AI要約アプリ',
    description: 'OllamaとSQLiteを利用したローカル向けAI要約アプリケーション',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
        <body className="antialiased">
        <DarkModeProvider>
            <Header/>
            {children}
        </DarkModeProvider>
        </body>
        </html>
    );
}
