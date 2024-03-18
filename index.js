const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const PORT = 5000;

//импорируем из файла route и users
const route = require('./route');
const { addUser, findUser, getAllUserRoom, removeUser } = require('./users');

//тут юзамем
app.use(cors({ origin: '*' }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  //1) получаем имя и номер комнаты и присоеденяемся к конкретной комнате. Когда получаем .on
  socket.on('join', async (data) => {
    const { user, room } = data;

    // Проверяем, существует ли пользователь уже в данной комнате
    const existingUser = findUser({ user, room });
    if (existingUser) {
      socket.emit('errJoin', {
        data: {
          message: 'Такой пользователь уже есть'
        }
      })
      return;
    }


    //подключаемся к комнате
    socket.join(room);

    //добавляем в нашу базу нового пользователя
    const { userInfo } = await addUser({ user, room });

    //и когда получили данные с фронта, отправляем туда 'message' и обьект с данными. Когда отправляем .emit
    socket.emit('message', {
      data: {
        user: {
          user: 'Admin',
        },
        message: `Hey ${userInfo.user}`,
      },
    });

    // когда пользователь подключился будем выводить сообщение всем остальным
    socket.broadcast.to(userInfo.room).emit('message', {
      data: { user: { user: 'Admin' }, message: `${userInfo.user} has Join the Room` },
    });

    //отдаем данные io.to на фронт (количество пользователей в комнате)
    io.to(userInfo.room).emit('roomUsers', {
      data: {
        allUsers: getAllUserRoom(userInfo.room),
      },
    });
  });

  //2) отправка сообщений(получаем с фронта инпут с сообщением и параметры)
  socket.on('sendMessage', ({ location, inputMessage }) => {
    const user = findUser(location);


    if (user) {
      console.log(user, 'user')
      io.to(user.room).emit("message", { data: { user: location, message: inputMessage } });
    }
  });

  //3) выход из комнаты
  socket.on('leftRoom', (params) => {
    const userDel = removeUser(params);


    if (userDel) {
      console.log(userDel, 'userDel')
      const { room, user } = userDel;

      io.to(room).emit("message", {
        data: { user: { user: "Admin" }, message: `${user} has left` },
      });

      io.to(room).emit("roomUsers", {
        data: { allUsers: getAllUserRoom(room) },
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnection');
  });
});

server.listen(PORT, () => {
  console.log('Server is running');
});
