const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const stripe = require('stripe')(
  'sk_test_51HGgblCk2FgipfrGFdNAlMJ9BrFUzKrKJkqegSFOg1m1jIANFnnWokQSPm2sjdhMO94jYGFCpfcdr8xssFaFMvv7008sJRBbwq'
);
const { v4: uuidv4 } = require('uuid');

const app = express();
// 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
// middleware
app.use(express.json());
app.use(cors());

// initializing nodemailer

// const options = {
//   service: 'SendGrid',
//   auth: {
//     api_user: 'akashdutta93@gmail.com',
//     api_key: 'akashmaroon5',
//   },
// };

const transporter = nodemailer.createTransport(
  // {
  //   host: 'smtp.mailtrap.io',
  //   port: 2525,
  //   auth: {
  //     user: 'be9929b70dd679',
  //     pass: '892ff6656bb4a9',
  //   },
  // }
  {
    service: 'SendGrid',
    auth: {
      api_user: 'akashdutta93@gmail.com',
      api_key: 'akashmaroon5',
    },
  }
);

// routes
app.post('/paymemt', (req, res) => {
  const { product, token } = req.body;
  console.log('Product', product);
  console.log('Price', product.price);
  const idempotencyKey = uuidv4();

  return (
    stripe.customers
      .create({
        email: token.email,
        source: token.id,
      })
      .then((customer) => {
        stripe.charges.create(
          {
            amount: product.price * 100,
            currency: 'INR',
            customer: customer.id,
            receipt_email: token.email,
            description: product.name,
            // receipt_url: token.url,
          },
          { idempotencyKey }
        );
      })
      // .then((result) =>

      //   res.status(200).json({
      //     result,
      //   })
      // )
      // .catch((err) => console.log(err));
      .then((charge) => {
        console.log('charge>', charge);
        const mailOptions = {
          from: 'Invoice <admin@netflixv2.com>',
          to: token.email,
          subject: 'A purchase was made',
          text: ' You have purchased a subscription! This is your invoice',
        };
        console.log('mailOptions>', mailOptions);
        transporter.sendMail(mailOptions, function (error, info) {
          console.log('error1>', error);
          console.log('info>', info);
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      })
      .catch((err) => console.log(err))
  );
});

// server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
