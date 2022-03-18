## 💻 About cnab-monitor

### Execute

yarn start


### Docker

* sudo service docker start

* sudo docker run --rm --name cnab-monitor --volume "/home/app/cnab-monitor:/srv/app" --workdir "/srv/app" --publish 3305:3305 -it node:14 bash

* docker exec -it cnab-monitor bash

* docker-compose up -d
* docker stop cnab-monitor
* docker rm cnab-monitor

## 📝 License

This project is MIT license.

Make with ❤️ by [Leonardo Cairo](https://www.linkedin.com/in/leocairos/)!
