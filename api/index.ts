import {
  Application,
  isHttpError,
  Status,
  Router,
} from 'https://deno.land/x/oak/mod.ts';
import { weatherData } from './data/data.ts';

const app = new Application();
const router = new Router();

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get('X-Response-Time');
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set('X-Response-Time', `${ms}ms`);
});

app.addEventListener('listen', ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? 'https://' : 'http://'}${
      hostname ?? 'localhost'
    }:${port}`,
  );
});

// Model
const _weatherData = new Map<string, any>;

_weatherData.set("1", {...weatherData});

// Routes
router
  .get('/', async (context, next) => {
    try {
      context.response.body = 'Hello World!';
      console.log(context.response);
      console.log(weatherData);
      await next();
    } catch (error) {
      if (isHttpError(error)) {
        switch (error.status) {
          case Status.NotFound:
            console.log('404 Not found');
            break;
          default:
            'TBA';
        }
      } else {
        console.log(`thrown: ${error}`);
        throw error;
      }
    }
  })
  .get('/v1/weather-data', async (context, next) => {
    context.response.body = Array.from(_weatherData.values());
    console.log(context.response.body);

  });

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
