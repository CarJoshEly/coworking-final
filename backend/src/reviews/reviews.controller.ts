import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Listar reseñas es público (se ven desde el detalle del espacio sin
// sesión); crear/editar/eliminar sí requiere estar autenticado.
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('spaces/:spaceId/reviews')
  create(
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Req() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.userId, spaceId, dto);
  }

  @Get('spaces/:spaceId/reviews')
  findAllForSpace(@Param('spaceId', ParseIntPipe) spaceId: number) {
    return this.reviewsService.findAllForSpace(spaceId);
  }

  @Get('reviews/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reviews/:id')
  update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, req.user.userId, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reviewsService.remove(id, req.user.userId, req.user.role);
  }
}
