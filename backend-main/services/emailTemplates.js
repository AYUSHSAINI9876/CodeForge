// Inline styles only: email clients strip <style> blocks and ignore external CSS.
function otpEmailTemplate({ username, code, expiryMinutes }) {
  const safeName = String(username || "there").replace(/[<>&]/g, "");
  const digits = String(code)
    .split("")
    .map(
      (d) => `<td style="padding:0 5px;">
        <div style="width:44px;height:56px;line-height:56px;text-align:center;font-family:'SFMono-Regular',Consolas,monospace;font-size:26px;font-weight:700;color:#f0f6fc;background:#0d1117;border:1px solid rgba(240,246,252,0.12);border-radius:10px;">${d}</div>
      </td>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your CodeForge verification code</title>
</head>
<body style="margin:0;padding:0;background:#010409;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your CodeForge code is ${code}. It expires in ${expiryMinutes} minutes.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#010409;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#161b22;border:1px solid rgba(240,246,252,0.1);border-radius:16px;overflow:hidden;">

          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#f85149 0%,#d29922 50%,#3fb950 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:36px 40px 8px;text-align:center;">
              <div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#f0f6fc;">
                &#9878;&#65039; CodeForge
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px 0;text-align:center;">
              <h1 style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#f0f6fc;">Verify it&rsquo;s you</h1>
              <p style="margin:12px 0 0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#8b949e;">
                Hi <strong style="color:#c9d1d9;">${safeName}</strong>, use the code below to finish signing in to your CodeForge account.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>${digits}</tr></table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <div style="padding:14px 16px;background:rgba(210,153,34,0.08);border:1px solid rgba(210,153,34,0.25);border-radius:10px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#d29922;text-align:center;">
                This code expires in <strong>${expiryMinutes} minutes</strong> and can only be used once.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 36px;">
              <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8b949e;text-align:center;">
                Didn&rsquo;t try to sign in? You can safely ignore this email &mdash; someone may have typed your address by mistake. Your account stays locked without this code.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;background:#0d1117;border-top:1px solid rgba(240,246,252,0.08);">
              <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#6e7681;text-align:center;">
                CodeForge &middot; This is an automated security message, please don&rsquo;t reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function otpEmailText({ username, code, expiryMinutes }) {
  return [
    `Hi ${username || "there"},`,
    "",
    `Your CodeForge verification code is: ${code}`,
    "",
    `This code expires in ${expiryMinutes} minutes and can only be used once.`,
    "",
    "If you didn't try to sign in, you can safely ignore this email.",
    "",
    "— CodeForge",
  ].join("\n");
}

module.exports = { otpEmailTemplate, otpEmailText };
