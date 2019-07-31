/* eslint-disable @typescript-eslint/no-unused-vars */
import * as EmptyActivityEndpoint from './empty_activity/index';
import * as EventEndpoint from './events/index';
import * as ManualTaskEndpoint from './manual_task/index';
import * as NotificationEndpoint from './notifications/index';
import * as ProcessModelEndpoint from './process_model/index';
import * as UserTaskEndpoint from './user_task/index';

export namespace Endpoints {
  export import EmptyActivity = EmptyActivityEndpoint;
  export import Event = EventEndpoint;
  export import ManualTask = ManualTaskEndpoint;
  export import Notification = NotificationEndpoint;
  export import ProcessModel = ProcessModelEndpoint;
  export import UserTask = UserTaskEndpoint;
}