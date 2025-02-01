const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const routes = require('./routes/router');
const conn = require('./config/config');
const receiptRoutes = require('./routes/ReceiptRouting');
const ProjectRoutes = require('./routes/ProjectRouting');
const userRoutes = require('./routes/UserRouting');
const extraChargesRoutes= require('./routes/UserExtraChargesRouting');
const plotsRouting =require('./routes/PlotRouting');
const downloadRouting = require('./routes/DownloadRoutiong');

const app = express();

// Increase body size limit for handling large payloads
app.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/', routes);
app.use('/receipt', receiptRoutes);
app.use('/project', ProjectRoutes);
app.use('/users', userRoutes);
app.use('/charges', extraChargesRoutes);
app.use('/plots', plotsRouting);
app.use('/download', downloadRouting);

// Multer setup for file uploads
// const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// // Example route for file uploads
// app.post('/upload', upload.single('photo'), (req, res) => {
//   console.log(req.file); // Handle uploaded file
//   res.send('File uploaded successfully');
// });


// Multer setup for file uploads
// const upload = multer({
//   limits: { fileSize: 50 * 1024 * 1024 }, // Set file size limit to 50 MB
//   fileFilter: (req, file, cb) => {
//     // Accept only specific file types (PDF)
//     const filetypes = /pdf/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(file.originalname.toLowerCase());

//     if (mimetype && extname) {
//       return cb(null, true); // File type is allowed
//     } else {
//       cb(new Error('Error: Only PDF files are allowed!')); // Reject file
//     }
//   },
// });

// Multer setup for file uploads
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// Example route for file uploads
app.post('/upload', upload.single('photo'), (req, res) => {
  console.log(req.file); // Handle uploaded file
  res.send('File uploaded successfully');
});


// Example route for file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or file type not supported.');
  }

  console.log(req.file); // Handle uploaded file (PDF)
  res.send('File uploaded successfully');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
