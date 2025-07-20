# Bharat Health Ally (भारत हेल्थ साथी)

A multilingual health chatbot web app that provides first aid tips, finds nearby clinics, and answers health-related queries in multiple Indian languages.

## Features

- Multilingual chatbot (supports English, Hindi, Bengali, Gujarati, Tamil, Telugu, Marathi, Punjabi, Kannada, Malayalam, Urdu)
- Speech-to-text input and text-to-speech output
- Find nearby clinics using OpenStreetMap (Nominatim)
- First aid and health tips
- Chat history persistence (local storage)
- Responsive and modern UI


## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup Guide

### 1. Clone the Repository

```sh
git clone https://github.com/AditiDiti/SwaDeshAI.git
cd SwaDeshAI
```

### 2. Install Dependencies

Install root dependencies (if any):

```sh
npm install
```

Install client dependencies:

```sh
cd client
npm install
```

### 3. Run the App Locally

Start the React development server:

```sh
npm start
```

This will launch the app at [http://localhost:3000](http://localhost:3000).

### 4. Running Tests

To run the test suite:

```sh
npm test
```

### 5. Build for Production

To create a production build:

```sh
npm run build
```

The optimized build will be in the `client/build` folder.

## Notes

- The chatbot uses browser APIs for speech recognition and synthesis. For best results, use Chrome or Edge.
- Clinic search uses OpenStreetMap Nominatim API and may require an internet connection.
- No backend server is required; all logic runs client-side.

## Folder Overview

- [`client/src/components/ChatBot.js`](client/src/components/ChatBot.js): Main chatbot component
- [`client/src/App.js`](client/src/App.js): App entry point
- [`client/public/`](client/public/): Static assets and HTML template

## License

MIT License

Copyright (c) [2025] [Aditi Goel and Team unordered_set]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      
copies of the Software, and to permit persons to whom the Software is         
furnished to do so, subject to the following conditions:                       

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.                                

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
