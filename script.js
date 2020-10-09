onload = function () {
  var chat = {
    messageToSend: "",
    messageResponses: [
        'Why did the web developer leave the restaurant? Because of the table layout.',
        'How do you comfort a JavaScript bug? You console it.',
        'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
        'What is the most used language in programming? Profanity.',
        'What is the object-oriented way to become wealthy? Inheritance.',
        'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
    ],

    // Initialization of the chatTree
    init: async function () {
      this.chatTree = new ChatTree();
      await this.chatTree.init();
      this.cacheDOM();
      this.bindEvents();
      await this.render();
    },

    // Taking out the frontend elements and storing them as objects.
    // References or id's of the frontend
    cacheDOM: function () {
      this.$chatHistory = $(".chat-history");
      this.$button = $("button");
      this.$textarea = $("#message-to-send");
      this.$chatHistoryList = this.$chatHistory.find("ul");
    },

    // Binding events with certain actions (just like event Listeners)
    bindEvents: function () {
      this.$button.on("click", this.addMessage.bind(this));
      this.$textarea.on("keyup", this.addMessageEnter.bind(this));
    },

    // Render is the medium between the input and the chatTree
    render: async function () {
        
      this.scrollToBottom();
      if (this.messageToSend.trim() !== "") {
        // Here we used handlebars for rendering the data.
        // Instead of taking references of elements and then filling the data.
        var template = Handlebars.compile($("#message-template").html());
        var context = {
          messageOutput: this.messageToSend,
          time: this.getCurrentTime(),
        };

        this.input = this.messageToSend;
        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val("");

        // responses
        var templateResponse = Handlebars.compile(
          $("#message-response-template").html()
        );
        var contextResponse = {
          response: await this.chatTree.getMessage(this.input),
          time: this.getCurrentTime(),
        };

        // setTimeout function to set the delay in responses to create the
        // chatbot effect.
        setTimeout(
          function () {
            this.$chatHistoryList.append(templateResponse(contextResponse));
            this.scrollToBottom();
          }.bind(this),
          1000
        );
      }
    },

    // Some Basic Functions (Helper functions)
    addMessage: function () {
      this.messageToSend = this.$textarea.val();
      this.render();
    },
    addMessageEnter: function (event) {
      // enter was pressed
      if (event.keyCode === 13) {
        this.addMessage();
      }
    },
    scrollToBottom: function () {
      this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function () {
      return new Date()
        .toLocaleTimeString()
        .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
  };

  chat.init();
};

class ChatTree {
  constructor() {}

  async init() {
    const data = await this.reset();

    // chat_tree object getting the tree from data.
    this.chat_tree = data;
    this.firstmsg = true;
    return "Chat has now been terminated. Send hi to begin chat again";
  }

  async reset() {
    const response = await fetch("chat_tree.json");
    const jsonResponse = await response.json();
    return jsonResponse;
  }

  async getMessage(input) {
    let resp = "";

    //input = new String(input.trim());
    //console.log(input);

    if (this.firstmsg === true) {
      this.firstmsg = false;

      // If the message is first message we add some extra response
      resp += "Hey there buddy</br>";
    } else {
      // Reset Case:
      if ("message" in this.chat_tree && input.trim() === "Reset") {
        return this.init();
      }

      // Invalid/Poor Input Case:
      // 1. NaN  2. Less than 0   3. Out of range(>4)
      if (
        isNaN(parseInt(input)) ||
        parseInt(input) <= 0 ||
        parseInt(input) > this.chat_tree["children"].length + 1
      )
        return "It seems like you gave a wrong input ! Go ahead try again !";

      // If the input is Last Child
      // Reset Case:
      if (parseInt(input) - 1 === this.chat_tree["children"].length) {
        this.init();
      }

      // Going to the children of the chat_tree node
      // Whatever the user inputs(1-3)
      // If 4 then reset case above taken care of.
      this.chat_tree = this.chat_tree["children"][parseInt(input) - 1];
    }

    if ("message" in this.chat_tree) {
      let data;

      // When we reach the joke or news child.(as both have type = function)
      if (this.chat_tree["type"] === "function") {
        // console.log(String(this.chat_tree['message']),String("getJoke()"));
        if (this.chat_tree["message"] === "getJoke()") {
          // eval used as we have taken function as string in chat_tree
          // eval evaluates the expression and ignores the string
          data = await eval(this.chat_tree["message"]);
          data = data.value.joke;
        } else {
          data = await eval(this.chat_tree["message"]);
          data = data.articles[0].title;
        }
      }

      // For the static String outputs.(type = normal)
      else {
        data = this.chat_tree["message"];
      }
      resp += data;
      resp += "<br><br>Please input <b>Reset</b> to reset chat now";
    } else {
      for (let i in this.chat_tree["child_msg"]) {
        resp +=
          String(parseInt(i) + 1) +
          ". " +
          this.chat_tree["child_msg"][parseInt(i)] +
          "<br>";
      }
    }
    return resp;
  }
}

async function getJoke() {
  const response = await fetch("https://api.icndb.com/jokes/random");
  const jsonResp = await response.json();
  return jsonResp;
}

async function getNews() {
  const response = await fetch(
    "http://newsapi.org/v2/top-headlines?country=in&pageSize=1&apiKey=a876816f98574cdfa23ffdc7d531c7bc"
  );
  const jsonResp = await response.json();
  return jsonResp;
}
