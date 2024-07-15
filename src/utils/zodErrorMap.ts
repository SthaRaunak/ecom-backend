import { ZodErrorMap } from "zod";

const customErrorMap: ZodErrorMap = (issue, _ctx) => {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return {
          message: `${issue.path.join(".")} is required`,
        };
      } else {
        return {
          message: `Expected ${issue.expected} , received ${issue.received}`,
        };
      }

    case "invalid_string":
      if (issue.validation === "email") {
        return {
          message: `Please enter a valid email address`,
        };
      }
      return { message: "Invalid string format" };

    case "invalid_enum_value":
      return {
        message: `Please enter a valid option (${issue.options.join(",")})`,
      };

    case "too_small":
      if (issue.type === "string" || issue.type === "number") {
        return {
          message: `Must be at least ${issue.minimum} ${
            issue.type === "string" ? "characters" : "digits"
          } long`,
        };
      }
      return {
        message: "Too Small",
      };
  }

  //fallback to default error message!
  return { message: _ctx.defaultError };
};

export { customErrorMap };
