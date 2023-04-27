import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {SequelizeModule} from "@nestjs/sequelize";
import { MovieModule } from './movie/movie.module';
import { PeopleModule } from './people/people.module';
import { GenresModule } from './genres/genres.module';
import { ImgsModule } from './imgs/imgs.module';
import {Movie} from "./movie/movie.model";
import {Genres} from "./genres/genres.model";
import {People} from "./people/people.model";
import {Images} from "./imgs/imgs.model";
import {MoviePeople} from "./people/moviepeople.model";
import {MovieGenres} from "./genres/moviegenres.model";


@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`
      }),
      SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.POSTGRES_HOST,
          port:Number(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          models: [Movie, Genres, People, Images, MoviePeople, MovieGenres],
          autoLoadModels: true
      }),
      MovieModule,
      PeopleModule,
      GenresModule,
      ImgsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}