import { Test, TestingModule } from '@nestjs/testing';
import { Events } from './events.';

describe('Events', () => {
  let provider: Events;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Events],
    }).compile();

    provider = module.get<Events>(Events);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
