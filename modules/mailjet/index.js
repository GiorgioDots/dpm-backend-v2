const fs = require("fs");
const path = require("path");
const config = require("../../config");

const Mailjet = require("node-mailjet");

const mailjet = new Mailjet({
  apiKey: config.mailjet.apiKey,
  apiSecret: config.mailjet.secretKey,
});
// const mailjet = require("node-mailjet").connect(
//   config.mailjet.apiKey,
//   config.mailjet.secretKey
// );

const forgottenPasswordTemplate = fs
  .readFileSync(
    path.join(
      config.rootPath,
      "email-templates",
      "basic",
      "password-reset",
      "content.html"
    )
  )
  .toString();

exports.sendForgottenPasswordEmail = (to, subject, mailInfo) => {
  let htmlContent = forgottenPasswordTemplate;
  htmlContent = htmlContent.replace("{{name}}", mailInfo.username);
  htmlContent = htmlContent.replace("{{action_url}}", mailInfo.action_url);
  htmlContent = htmlContent.replace("{{action_url}}", mailInfo.action_url);
  htmlContent = htmlContent.replace("{{support_url}}", mailInfo.support_url);
  htmlContent = htmlContent.replace(
    "{{operating_system}}",
    mailInfo.operating_system
  );
  htmlContent = htmlContent.replace("{{browser_name}}", mailInfo.browser_name);

  return this.sendEmail(to, mailInfo.username, subject, htmlContent);
};

exports.sendEmail = async (to, toName, subject, html) => {
  try {
    await mailjet.post("send", { version: config.mailjet.version }).request({
      Messages: [
        {
          From: {
            Email: config.mailjet.fromMailAddress,
            Name: config.mailjet.fromName,
          },
          To: [
            {
              Email: to,
              Name: toName,
            },
          ],
          Subject: subject,
          HTMLPart: html,
          CustomID: "MyLifeDev",
        },
      ],
    });
  } catch (error) {
    throw error;
  }
};
