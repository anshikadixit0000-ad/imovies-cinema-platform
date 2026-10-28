@echo off
title IMovies Cinema Launcher
echo ========================================================
echo     Starting IMovies Full-Stack Cinema Platform...
echo ========================================================

echo Starting Backend Server on http://localhost:5000...
start cmd /k "cd backend && node src/server.js"

echo Starting Frontend React Client on http://localhost:5173...
start cmd /k "cd client && npm run dev"

echo.
echo Both Backend and Frontend processes are launching!
echo Please open your browser at: http://localhost:5173
echo ========================================================
