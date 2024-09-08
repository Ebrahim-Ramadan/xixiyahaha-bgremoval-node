const express = require('express');
const sharp = require('sharp');
const { Rembg } = require('@xixiyahaha/rembg-node');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/', async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).send('No image data provided');
    }

    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const input = sharp(buffer);

    const rembg = new Rembg({
      logging: true,
    });

    const output = await rembg.remove(input);

    const processedBuffer = await output.webp().toBuffer();

    const processedBase64 = processedBuffer.toString('base64');

    res.json({ image: `data:image/webp;base64,${processedBase64}` });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports.handler = serverless(app);