const fs = require("fs");
const { Post } = require("./config_axios");

const users = JSON.parse(fs.readFileSync("user.json", "utf8"));
const iframes = JSON.parse(fs.readFileSync("iframe.json", "utf8"));

const getMe = async (token) => {
  try {
    const response = await Post(
      "https://api.agent301.org/getMe",
      {
        referrer_id: 0,
      },
      token
    );
    return response.data.result;
  } catch (error) {
    console.log(error.response);
  }
};

async function complete_task_video(token) {
  for (let i = 0; i < 30; i++) {
    try {
      const response = await Post(
        "https://api.agent301.org/completeTask",
        {
          type: "video",
        },
        token
      );
      console.log("response", response.data);
      if (response.status === 200) {
        console.log("Task completed successfully");
      } else {
        console.log("Task completion failed");
      }
    } catch (error) {
      console.log(error.response);
      return;
    }
  }
}

const spin_wheel = async (token, tickets) => {
  for (let i = 1; i <= tickets; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const response = await Post(
        "https://api.agent301.org/wheel/spin",
        {},
        token
      );
      const reward = response.data.result.reward;
      console.log("response", reward);
      if (reward === "t1" || reward === "t3") {
        spin_wheel(token, tickets);
      }
    } catch (error) {
      console.log("Try again...");
    }
  }
  console.log("Spin wheel completed");
  return true;
};

const get_tasks_wheel = async (token) => {
  try {
    const response = await Post(
      "https://api.agent301.org/wheel/load",
      {},
      token
    );
    const list_tasks = response.data.result.tasks;
    const keys = Object.keys(list_tasks);
    console.log("keys");
    return keys;
  } catch (error) {
    console.log(error.response);
  }
};

const claim_task_hour = async (token) => {
  for (let i = 0; i < 5; i++) {
    try {
      const response = await Post(
        "https://api.agent301.org/wheel/task",
        {
          type: "hour",
        },
        token
      );
      if (response.status === 200) {
        console.log("Task wheel claimed successfully");
      } else {
        console.log("Task wheel claiming failed");
      }
    } catch (error) {
      console.log(error.response);
    }
  }
};

const claim_task_wheel = async (token) => {
  const task_type = await get_tasks_wheel(token);
  console.log("task_type", task_type);
  for (const task of task_type) {
    if (task === "hour") {
      await claim_task_hour(token);
    } else {
      if (task !== "boom") {
        try {
          const response = await Post(
            "https://api.agent301.org/wheel/task",
            {
              type: task,
            },
            token
          );
          if (response.status === 200) {
            console.log("Task wheel claimed successfully");
          } else {
            console.log("Task wheel claiming failed");
          }
        } catch (error) {
          console.log(error.response);
        }
      } else {
        return;
      }
    }
  }
};

const get_tasks_daily = async (token) => {
  try {
    const response = await Post("https://api.agent301.org/getTasks", {}, token);
    const list_tasks = response.data.result.data;
    const list_tasks_not_done = list_tasks.filter((task) => !task.is_claimed);
    const types = list_tasks_not_done.map((it) => it.type);
    console.log("typessss", types);
    return types;
  } catch (error) {
    console.log(error.response);
  }
};

const complete_task_daily = async (token) => {
  const types = await get_tasks_daily(token);
  console.log("types", types);
  for (const type of types) {
    try {
      const response = await Post(
        "https://api.agent301.org/completeTask",
        { type },
        token
      );
      if (response.data.result.is_completed) {
        console.log(`Đã hoàn thành task ${type}`);
      } else {
        console.log(`Không thể hoàn thành task ${type}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
async function main() {
  console.log("Starting...");
  for (const iframe of iframes) {
    const web_app_data = Object.fromEntries(
      new URLSearchParams(iframe.replace(/.*tgWebAppData/, "tgWebAppData"))
    );

    const user = web_app_data.tgWebAppData;
    Promise.all([
      await complete_task_video(user),
      await claim_task_wheel(user),
      await complete_task_daily(user),
    ]);
    const tickets = await getMe(user);
    console.log("tickets", tickets);
    const response = await spin_wheel(user, tickets.tickets);
    if (response > 0) {
      const new_current_tickets = await getMe(user);
      console.log("new_current_tickets", new_current_tickets.tickets);
      await spin_wheel(user, new_current_tickets.tickets);
    }
  }
}

main();
