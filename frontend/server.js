const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // ✅ Fix Port

// ✅ Static फाइल्स को Serve करने के लिए
app.use(express.static('public'));

// ✅ Root URL पर सही `index.html` दिखाएं
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ सर्वर स्टार्ट करें
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
