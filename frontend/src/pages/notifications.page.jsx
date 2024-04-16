import { useContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import { UserContext } from "../context/context";
import { filterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notification = () => {
  const {
    setUserAuth,
    userAuth,
    userAuth: { accessToken, new_notification_available },
  } = useContext(UserContext);

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  let filters = ["all", "like", "comment", "reply"];

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
        { page, filter, deletedDocCount },
        {
          headers: {
            "X-accessToken": accessToken,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        let formateddata = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/all-notifications-count",
          data_to_send: { filter },
          user: accessToken,
        });

        setNotifications(formateddata);
        // console.log("formatedData", formateddata);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotifications({ page: 1 });
    }
  }, [accessToken, filter]);

  const handleFilter = (e) => {
    let btn = e.target;

    setFilter(btn.innerHTML);
    setNotifications(null);
  };

  // console.log("notifications", notification);
  return (
    <AnimationWrapper>
      <div>
        <h1 className="max-md:hidden">Recent Notification</h1>
        <div className="my-8 flex gap-6">
          {filters.map((filterName, i) => {
            return (
              <button
                onClick={handleFilter}
                key={i}
                className={
                  "py-2 " + (filter === filterName ? " btn-dark" : "btn-light")
                }
              >
                {filterName}
              </button>
            );
          })}
        </div>
        {notifications === null ? (
          <Loader />
        ) : (
          <>
            {notifications.results.length ? (
              notifications.results.map((notification, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                    <NotificationCard
                      data={notification}
                      index={i}
                      notificationState={{ notifications, setNotifications }}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="Nothing Available" />
            )}
          </>
        )}

        <LoadMoreDataBtn
          state={notifications}
          fetchDataFun={fetchNotifications}
          additionalParam={{
            deletedDocCount: notifications ? notifications.deletedDocCount : 0,
          }}
        />
      </div>
    </AnimationWrapper>
  );
};

export default Notification;
