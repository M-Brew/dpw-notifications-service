const sendSmsValidation = (details: { to: string; body: string }) => {
  const { to, body } = details;

  const errors: Record<string, string> = {};

  if (!to || to.trim() === "") {
    errors.to = "Recipient phone number is required";
  } else {
    if (to.length < 10) {
      errors.to = "Phone number should be a minimum of 10 digits";
    }
  }

  if (!body || body.trim() === "") {
    errors.body = "Message body is required";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

const sendEmailValidation = (details: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) => {
  const { to, subject, htmlContent, textContent } = details;

  const errors: Record<string, string> = {};

  if (!to || to.trim() === "") {
    errors.to = "Recipient email is required";
  } else {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!to.match(emailRegex)) {
      errors.to = "Recipient email must be a valid email address";
    }
  }

  if (!subject || subject.trim() === "") {
    errors.subject = "Email subject is required";
  }

  if (!htmlContent || htmlContent.trim() === "") {
    errors.htmlContent = "HTML content is required";
  }

  if (!textContent || textContent.trim() === "") {
    errors.textContent = "Text content is required";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export { sendSmsValidation, sendEmailValidation };
