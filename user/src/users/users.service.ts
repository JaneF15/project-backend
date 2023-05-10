import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RolesService } from 'src/roles/roles.service';
import { AddRoleDto } from './dto/add-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.model';
import { UpdateUserPhoneDto } from './dto/update-user-phone.dto';
import { UpdateUserLinkDto } from './dto/update-user-link.dto';


@Injectable()
export class UsersService {

  constructor(@InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService) {
  }

  async createUser(userDto: CreateUserDto) {
    const role = await this.roleService.getRoleByValue("USER");
    const user = await this.userRepository.create(userDto);
    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  async activateUser(link: string) {
    return await this.userRepository.update({ isActivated: true }, { where: { activationLink: link } });
  }

  async updateActivationLink(dto: UpdateUserLinkDto) {
    return await this.userRepository.update({ activationLink: dto.link }, { where: { email: dto.email } });
  }

  async getAllUsers() {
    return await this.userRepository.findAll({ include: { all: true } });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email }, include: { all: true } });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      return new HttpException('User doesnt exist', HttpStatus.NOT_FOUND);
    }
    return user;

  }

  async addRole(dto: AddRoleDto) {
    return await this.addOrRemoveRole(dto, 'add');
  }

  async deleteUser(id: number) {
    const user = await this.getUserById(id);
    await this.userRepository.destroy({ where: { id } });
    return user;
  }

  async updateUser(userDto: UpdateUserDto) {
    return await this.userRepository.update(userDto, { where: { id: userDto.id } });
  }

  async updateUserPhone(dto: UpdateUserPhoneDto) {
    return await this.userRepository.update({ ...dto, phoneNumber: dto.phoneNumber }, { where: { id: dto.id } });
  }

  async removeRole(dto: AddRoleDto) {
    return await this.addOrRemoveRole(dto, 'remove');
  }

  async getUserByLink(link: string) {
    const user = await this.userRepository.findOne({ where: { activationLink: link } });
    if (!user) {
      return new HttpException('User doesnt exist', HttpStatus.NOT_FOUND);
    }
    return user;
  }


  private async addOrRemoveRole(dto: AddRoleDto, operation: string) {
    const user = await this.userRepository.findByPk(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);

    if (dto.value == 'USER') {
      return new HttpException('Role "USER" is disabled for using', HttpStatus.BAD_REQUEST);
    }

    if (!role) {
      return new HttpException(`Role "${role}" not found`, HttpStatus.NOT_FOUND);
    }

    if (!user) {
      return new HttpException('User doesnt exist', HttpStatus.NOT_FOUND);
    }

    if (operation == 'add') {
      await user.$add('roles', role.id);
      return dto;
    } else if (operation == 'remove') {
      await user.$remove('roles', role.id);
      return dto;
    }
  }
}

