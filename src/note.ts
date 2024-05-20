import os from "os";

function fixLineBreak(text: string) {
  return text.replace("\\n", os.EOL);
}

export default async function note(
  text: string,
  visibility: string = "specified"
) {
  const token = process.env.TOKEN ?? null;
  const instance = process.env.INSTANCE ?? null;

  if (token === null) {
    console.error("Missing token.\n" + "Set token={Your Misskey Token}");
    return;
  } else if (instance === null) {
    console.error(
      "Missing instance.\n" +
        "Set instance={Your Misskey Instance. e.g. https://example.com}"
    );
    return;
  }

  let url: URL;
  try {
    url = new URL("/api/notes/create", instance);
  } catch (error) {
    console.error(`Failed parse URL. Instance: ${instance}`);
    throw error;
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const body = {
    i: token,
    text: fixLineBreak(text),
    visibility: visibility,
  };
  const request = new Request(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  return new Promise((resolve, reject) => {
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          reject(
            new Error(
              `Note Failure.\n` +
                `\t${response.status} : ${response.statusText}\n` +
                `\tInstance: ${instance}\n` +
                `\tVisibility: ${visibility}\n` +
                `\tText:\n` +
                `\t${fixLineBreak(text)}`
            )
          );
        } else {
          resolve("Note Success.");
        }
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
}
