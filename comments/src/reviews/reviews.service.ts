import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {CreateReviewDto} from './dto/create-review.dto';
import {Review} from './reviews.model';
import {UpdateReviewDto} from "./dto/update-review.dto";

@Injectable()
export class ReviewsService {
    constructor(@InjectModel(Review) private reviewRepository: typeof Review) { }

    async create(dto: CreateReviewDto) {
        try {
            return await this.reviewRepository.create(dto);
        } catch (error) {
            return error.parent;
        }

    }

    async removeOneById(id: number) {
        return await this.reviewRepository.destroy({ where: { id: id } });
    }

    async removeAllByUserId(id: number) {
        return await this.reviewRepository.destroy({ where: { userId: id } });
    }

    async getAll() : Promise<Review[]> {
        return await this.reviewRepository.findAll({
            include: { all: true }
        });
    }

    async getByMovieId(id: number) : Promise<Review[]> {
        return await this.reviewRepository.findAll({ where: { movieId: id } });
    }

    async getByUserId(id: number) : Promise<Review[]> {
        return await this.reviewRepository.findAll({ where: { userId: id } });
    }

    async getOneById(id: number) : Promise<Review> {
        return await this.reviewRepository.findByPk(id);
    }

    async update(dto: UpdateReviewDto) : Promise<Review> {
        const review : Review = await this.reviewRepository.findByPk(dto.id);
        return await review.update(dto);
    }

    async increaseRate(id: number) {
        return await this.changeRate(id, 'increase');
    }

    async decreaseRate(id: number) {
        return await this.changeRate(id, 'decrease');
    }

    private async changeRate(id: number, operation: string) {
        const review = await this.getOneById(id);
        if(!review){
            return new HttpException(`Review with "${id}" ID not found`, HttpStatus.NOT_FOUND); 
        }
        if (operation == 'increase') {
            review.rate = review.rate + 1;
        } else if (operation == 'decrease') {
            review.rate = review.rate - 1;
        }
        await review.save();
        return review;
    }
}
