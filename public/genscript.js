function toggleMenu() {
  const menuOptions = document.getElementById("menuOptions");
  menuOptions.classList.toggle("active-menu");

  // const header = document.getElementById("header");
  // header.style.height = menuOptions.classList.contains("active-menu")
  //   ? `${menuOptions.scrollHeight + header.clientHeight}px`
  //   : ``;
}
function limitStr(str, lim = 20) {
  return str.length > lim ? str.slice(0, lim) + "..." : str;
}
function handleOptionClick(option) {
  console.log(option + " clicked!");
  window.location.href = option;
  toggleMenu();
}
function mapKey(meta, indent = 0) {
  const indentation = "&nbsp;".repeat(indent * 2);
  return Object.entries(meta || {})
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const listItems = value.map((item) => `<li>${item}</li>`).join("");
        return `<p style="margin-left: ${
          indent * 20
        }px;"><strong>${key}</strong>:<ul>${listItems}</ul></p>`;
      } else if (typeof value === "object" && value !== null) {
        return `<p style="margin-left: ${
          indent * 20
        }px;"><strong>${key}</strong>:<br>${mapKey(value, indent + 1)}</p>`;
      } else {
        return `<p style="margin-left: ${
          indent * 20
        }px;"><strong>${key}</strong>: ${value}</p>`;
      }
    })
    .join("\n");
}
function smoothScroll() {
  const duration = 1000;
  const startTime = performance.now();
  const startY = window.scrollY;
  const endY = document.documentElement.scrollHeight - window.innerHeight;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function scroll() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime < duration) {
      const easedTime = easeOutExpo(elapsedTime / duration);
      const newY = startY + (endY - startY) * easedTime;
      window.scrollTo(0, newY);
      requestAnimationFrame(scroll);
    } else {
      window.scrollTo(0, endY);
    }
  }

  requestAnimationFrame(scroll);
}

function smoothScroll2(container = document.documentElement) {
  const duration = 1000;
  const startTime = performance.now();

  const startY = container.scrollTop;
  const endY = container.scrollHeight - container.clientHeight;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function scroll() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime < duration) {
      const easedTime = easeOutExpo(elapsedTime / duration);
      const newY = startY + (endY - startY) * easedTime;
      container.scrollTo(0, newY);
      requestAnimationFrame(scroll);
    } else {
      container.scrollTo(0, endY);
    }
  }

  requestAnimationFrame(scroll);
}

function copyToClipboard(text) {
  var textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function sanitizeHTML(input) {
  // var sanitizedText = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // sanitizedText = sanitizedText.replace(/\n/g, "<br>");
  // sanitizedText = sanitizedText.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  // sanitizedText = sanitizedText.replace(/&/g, "&amp;");
  const i = document.createElement("div");
  i.innerText = input;
  const sanitizedText = i.innerHTML;
  return autoAnchor(sanitizedText);
}
function autoAnchor(text) {
  const urlRegex =
    /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi;
  const anchorText = "Learn more";

  const textWithAnchors = text.replace(urlRegex, (match) => {
    let url = match;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return `<strong><a href="${sanitizeHTML(
      url
    )}" style="color: white;" target="_blank">${match}</a><strong>`;
  });

  return textWithAnchors;
}
